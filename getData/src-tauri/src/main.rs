// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use reqwest;
use serde::{Deserialize, Serialize};
use serde_json::{Value, Map};
use std::collections::HashSet;
use std::fs::{File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use tauri::State;
use tokio::sync::Mutex;

// State สำหรับเก็บ configuration และข้อมูลที่ fetch แล้ว
struct AppState {
    fetched_keys: Mutex<HashSet<String>>,
    is_fetching: Mutex<bool>,
}

#[derive(Clone, Serialize, Deserialize)]
struct Config {
    api_url: String,
    output_file: String,
    fetch_interval_seconds: u64,
    selected_fields: Vec<String>,
    unique_key: String,
    data_path: Vec<String>,
}

#[derive(Clone, Serialize)]
struct FetchResult {
    success: bool,
    message: String,
    new_items_count: usize,
    total_count: usize,
}

#[derive(Clone, Serialize)]
struct ApiPreview {
    success: bool,
    structure: String,
    sample_data: Option<Value>,
    fields: Vec<String>,
    error: Option<String>,
}

// --- Tauri Commands ---

#[tauri::command]
async fn fetch_api_preview(api_url: String) -> ApiPreview {
    match fetch_raw_json(&api_url).await {
        Ok(raw_response) => {
            let structure = format_structure(&raw_response, 0);
            
            ApiPreview {
                success: true,
                structure,
                sample_data: Some(raw_response),
                fields: Vec::new(),
                error: None,
            }
        }
        Err(e) => ApiPreview {
            success: false,
            structure: String::new(),
            sample_data: None,
            fields: Vec::new(),
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
async fn extract_data_fields(raw_data: Value, data_path: Vec<String>) -> ApiPreview {
    match extract_data_from_path(&raw_data, &data_path) {
        Ok(sample_data) => {
            if sample_data.is_empty() {
                return ApiPreview {
                    success: false,
                    structure: String::new(),
                    sample_data: None,
                    fields: Vec::new(),
                    error: Some("ไม่พบข้อมูลใน path ที่ระบุ".to_string()),
                };
            }

            let fields = extract_fields(&sample_data[0]);
            
            ApiPreview {
                success: true,
                structure: String::new(),
                sample_data: Some(sample_data[0].clone()),
                fields,
                error: None,
            }
        }
        Err(e) => ApiPreview {
            success: false,
            structure: String::new(),
            sample_data: None,
            fields: Vec::new(),
            error: Some(e.to_string()),
        },
    }
}

#[tauri::command]
async fn start_fetching(
    config: Config,
    state: State<'_, AppState>,
) -> Result<FetchResult, String> {
    // Check if already fetching
    {
        let mut is_fetching = state.is_fetching.lock().await;
        if *is_fetching {
            return Err("กำลัง fetch อยู่แล้ว".to_string());
        }
        *is_fetching = true;
    } // Lock is dropped here

    // โหลดข้อมูลเดิม
    {
        let mut fetched_keys = state.fetched_keys.lock().await;
        *fetched_keys = load_fetched_keys(&config.output_file, &config.unique_key)
            .unwrap_or_else(|_| HashSet::new());
    } // Lock is dropped here

    // Fetch ข้อมูล
    let fetch_result = fetch_data(&config.api_url, &config.data_path).await;
    
    // Convert Result to avoid Send issues with Box<dyn Error>
    let items_result = fetch_result.map_err(|e| e.to_string());
    
    match items_result {
        Ok(items) => {
            let mut new_items_count = 0;
            
            // Process items
            {
                let mut fetched_keys = state.fetched_keys.lock().await;

                for item in items {
                    let key_value = match extract_key_value(&item, &config.unique_key) {
                        Some(v) => v,
                        None => continue,
                    };

                    if !fetched_keys.contains(&key_value) {
                        let filtered_item = filter_fields(&item, &config.selected_fields);

                        if let Err(_) = save_to_file(&filtered_item, &config.output_file) {
                            continue;
                        }

                        fetched_keys.insert(key_value.clone());
                        new_items_count += 1;
                    }
                }
            } // Lock is dropped here

            let total_count = state.fetched_keys.lock().await.len();

            // Reset fetching flag
            {
                let mut is_fetching = state.is_fetching.lock().await;
                *is_fetching = false;
            }

            Ok(FetchResult {
                success: true,
                message: format!("เพิ่มข้อมูลใหม่ {} รายการ", new_items_count),
                new_items_count,
                total_count,
            })
        }
        Err(error_msg) => {
            // Reset fetching flag on error
            {
                let mut is_fetching = state.is_fetching.lock().await;
                *is_fetching = false;
            }

            Err(format!("เกิดข้อผิดพลาด: {}", error_msg))
        }
    }
}

#[tauri::command]
async fn stop_fetching(state: State<'_, AppState>) -> Result<String, String> {
    let mut is_fetching = state.is_fetching.lock().await;
    *is_fetching = false;
    Ok("หยุด fetching แล้ว".to_string())
}

#[tauri::command]
async fn get_fetched_count(state: State<'_, AppState>) -> Result<usize, String> {
    let fetched_keys = state.fetched_keys.lock().await;
    Ok(fetched_keys.len())
}

#[tauri::command]
async fn deduplicate_file(file_path: String, unique_key: String) -> Result<FetchResult, String> {
    match deduplicate_data_file(&file_path, &unique_key) {
        Ok((removed_count, total_count)) => Ok(FetchResult {
            success: true,
            message: format!("ลบข้อมูลซ้ำ {} รายการ", removed_count),
            new_items_count: 0,
            total_count,
        }),
        Err(e) => Err(format!("เกิดข้อผิดพลาด: {}", e)),
    }
}

// --- Helper Functions (นำมาจาก main.rs เดิม) ---

async fn fetch_raw_json(api_url: &str) -> Result<Value, Box<dyn std::error::Error>> {
    let response = reqwest::get(api_url).await?;
    if !response.status().is_success() {
        return Err(format!("API returned status: {}", response.status()).into());
    }
    let data: Value = response.json().await?;
    Ok(data)
}

fn format_structure(value: &Value, indent: usize) -> String {
    let prefix = "  ".repeat(indent);
    let mut result = String::new();
    
    match value {
        Value::Object(map) => {
            for (key, val) in map.iter().take(5) {
                match val {
                    Value::Array(arr) => {
                        result.push_str(&format!("{}{}: Array[{}]\n", prefix, key, arr.len()));
                        if !arr.is_empty() {
                            result.push_str(&format_structure(&arr[0], indent + 1));
                        }
                    }
                    Value::Object(_) => {
                        result.push_str(&format!("{}{}: Object\n", prefix, key));
                        result.push_str(&format_structure(val, indent + 1));
                    }
                    _ => {
                        let preview = format!("{}", val);
                        let preview_short = if preview.len() > 50 {
                            format!("{}...", &preview[..50])
                        } else {
                            preview
                        };
                        result.push_str(&format!("{}{}: {}\n", prefix, key, preview_short));
                    }
                }
            }
            if map.len() > 5 {
                result.push_str(&format!("{}... และอีก {} ฟิลด์\n", prefix, map.len() - 5));
            }
        }
        Value::Array(arr) => {
            result.push_str(&format!("{}Array[{}]\n", prefix, arr.len()));
            if !arr.is_empty() {
                result.push_str(&format_structure(&arr[0], indent + 1));
            }
        }
        _ => {}
    }
    
    result
}

fn extract_data_from_path(
    value: &Value,
    path: &[String],
) -> Result<Vec<Value>, Box<dyn std::error::Error>> {
    let mut current = value;

    for segment in path {
        current = current
            .get(segment)
            .ok_or(format!("ไม่พบ key '{}' ในข้อมูล", segment))?;
    }

    if let Some(array) = current.as_array() {
        return Ok(array.clone());
    }

    Ok(vec![current.clone()])
}

async fn fetch_data(
    api_url: &str,
    data_path: &[String],
) -> Result<Vec<Value>, Box<dyn std::error::Error>> {
    let raw_json = fetch_raw_json(api_url).await?;
    extract_data_from_path(&raw_json, data_path)
}

fn extract_fields(data: &Value) -> Vec<String> {
    if let Some(obj) = data.as_object() {
        return obj.keys().cloned().collect();
    }
    Vec::new()
}

fn extract_key_value(data: &Value, key: &str) -> Option<String> {
    data.get(key).and_then(|v| match v {
        Value::String(s) => Some(s.clone()),
        Value::Number(n) => Some(n.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        _ => Some(v.to_string()),
    })
}

fn filter_fields(data: &Value, selected_fields: &[String]) -> Value {
    if let Some(obj) = data.as_object() {
        let mut filtered = Map::new();
        for field in selected_fields {
            if let Some(value) = obj.get(field) {
                filtered.insert(field.clone(), value.clone());
            }
        }
        return Value::Object(filtered);
    }
    data.clone()
}

fn save_to_file(item: &Value, filename: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(filename)?;

    let json_line = serde_json::to_string(item)?;
    writeln!(file, "{}", json_line)?;

    Ok(())
}

fn load_fetched_keys(
    filename: &str,
    key_name: &str,
) -> Result<HashSet<String>, Box<dyn std::error::Error>> {
    let mut keys = HashSet::new();

    if !Path::new(filename).exists() {
        return Ok(keys);
    }

    let file = File::open(filename)?;
    let reader = BufReader::new(file);

    for line in reader.lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }

        if let Ok(item) = serde_json::from_str::<Value>(&line) {
            if let Some(key_value) = extract_key_value(&item, key_name) {
                keys.insert(key_value);
            }
        }
    }

    Ok(keys)
}

fn deduplicate_data_file(
    filename: &str,
    key_name: &str,
) -> Result<(usize, usize), Box<dyn std::error::Error>> {
    if !Path::new(filename).exists() {
        return Err("ไม่พบไฟล์".into());
    }

    let file = File::open(filename)?;
    let reader = BufReader::new(file);

    let mut seen_keys = HashSet::new();
    let mut unique_items = Vec::new();
    let mut original_count = 0;
    let mut duplicate_count = 0;

    // อ่านทุกบรรทัดและเก็บเฉพาะที่ไม่ซ้ำ
    for line in reader.lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }

        original_count += 1;

        if let Ok(item) = serde_json::from_str::<Value>(&line) {
            if let Some(key_value) = extract_key_value(&item, key_name) {
                if !seen_keys.contains(&key_value) {
                    seen_keys.insert(key_value);
                    unique_items.push(line);
                } else {
                    duplicate_count += 1;
                }
            }
        }
    }

    // เขียนข้อมูลที่ไม่ซ้ำกลับไปที่ไฟล์
    let mut file = File::create(filename)?;
    for item in &unique_items {
        writeln!(file, "{}", item)?;
    }

    Ok((duplicate_count, unique_items.len()))
}

// --- Main Tauri App ---

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .manage(AppState {
            fetched_keys: Mutex::new(HashSet::new()),
            is_fetching: Mutex::new(false),
        })
        .invoke_handler(tauri::generate_handler![
            fetch_api_preview,
            extract_data_fields,
            start_fetching,
            stop_fetching,
            get_fetched_count,
            deduplicate_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

