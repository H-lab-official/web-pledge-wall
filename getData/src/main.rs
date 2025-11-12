use reqwest;
use serde_json::{Value, Map};
use std::collections::HashSet;
use std::fs::{File, OpenOptions};
use std::io::{self, BufRead, BufReader, Write};
use std::path::Path;
use tokio::time::{sleep, Duration};

// Configuration
struct Config {
    api_url: String,
    output_file: String,
    fetch_interval_seconds: u64,
    selected_fields: Vec<String>,
    unique_key: String,
    data_path: Vec<String>, // path to actual data in nested structure
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 โปรแกรมดึงข้อมูลจาก API");
    println!("========================================\n");

    // รับ API URL
    println!("📍 กรุณาใส่ API URL:");
    let api_url = read_input()?;

    // ทดลองดึงข้อมูลครั้งแรก
    println!("\n🔄 กำลังทดลองดึงข้อมูลจาก API...");
    let raw_response = fetch_raw_json(&api_url).await?;

    println!("✅ ดึงข้อมูลสำเร็จ!\n");

    // แสดง structure ของ response
    println!("📋 Structure ของ API Response:");
    display_structure(&raw_response, 0);
    println!();

    // ถามว่าข้อมูลอยู่ตรง root หรือ nested
    println!("📂 ข้อมูลที่ต้องการดึงอยู่ที่ไหน?");
    println!("   1. ที่ root level (response เป็น array โดยตรง)");
    println!("   2. อยู่ภายใน object (เช่น response.data)");
    println!("   เลือก (1 หรือ 2):");
    
    let is_nested = read_number(1, 2)? == 2;
    
    let data_path = if is_nested {
        // ให้เลือก path ไป data
        println!("\n🔍 กรุณาระบุ path ไปยังข้อมูล (คั่นด้วย . เช่น: data):");
        let path_input = read_input()?;
        path_input.split('.').map(|s| s.trim().to_string()).collect()
    } else {
        Vec::new()
    };

    // ดึงข้อมูลจริงตาม path
    let sample_data = extract_data_from_path(&raw_response, &data_path)?;

    if sample_data.is_empty() {
        println!("❌ ไม่พบข้อมูลใน path ที่ระบุ");
        return Ok(());
    }

    println!("\n✅ พบข้อมูล {} รายการ\n", sample_data.len());

    // แสดง preview ข้อมูลตัวแรก
    println!("📋 Preview ข้อมูลตัวแรก:");
    println!("{}", serde_json::to_string_pretty(&sample_data[0])?);
    println!();

    // ดึงรายชื่อฟิลด์ทั้งหมด
    let fields = extract_fields(&sample_data[0]);
    
    if fields.is_empty() {
        println!("❌ ไม่พบฟิลด์ในข้อมูล");
        return Ok(());
    }

    println!("📝 ฟิลด์ที่พบในข้อมูล:");
    for (i, field) in fields.iter().enumerate() {
        // แสดง preview ค่าของแต่ละฟิลด์
        let sample_value = get_field_preview(&sample_data[0], field);
        println!("  {}. {} (ตัวอย่าง: {})", i + 1, field, sample_value);
    }
    println!();

    // เลือก unique key
    println!("🔑 กรุณาเลือกฟิลด์ที่จะใช้เป็น unique key (ป้องกันข้อมูลซ้ำ):");
    println!("   ใส่หมายเลข (1-{}):", fields.len());
    let unique_key_index = read_number(1, fields.len())? - 1;
    let unique_key = fields[unique_key_index].clone();
    println!("✅ ใช้ '{}' เป็น unique key\n", unique_key);

    // เลือกฟิลด์ที่ต้องการเก็บ
    println!("📝 เลือกฟิลด์ที่ต้องการเก็บ:");
    println!("   ใส่หมายเลขคั่นด้วยเครื่องหมายจุลภาค (เช่น: 1,2,3)");
    println!("   หรือใส่ 'all' เพื่อเลือกทั้งหมด:");
    
    let selected_fields = loop {
        let input = read_input()?;
        
        if input.trim().to_lowercase() == "all" {
            break fields.clone();
        }
        
        let mut selected = Vec::new();
        let mut valid = true;
        
        for num_str in input.split(',') {
            match num_str.trim().parse::<usize>() {
                Ok(num) if num >= 1 && num <= fields.len() => {
                    selected.push(fields[num - 1].clone());
                }
                _ => {
                    println!("❌ หมายเลข '{}' ไม่ถูกต้อง กรุณาลองใหม่:", num_str.trim());
                    valid = false;
                    break;
                }
            }
        }
        
        if valid && !selected.is_empty() {
            break selected;
        }
    };

    println!("✅ เลือก {} ฟิลด์:", selected_fields.len());
    for field in &selected_fields {
        println!("   - {}", field);
    }
    println!();

    // ชื่อไฟล์เก็บข้อมูล
    println!("💾 ชื่อไฟล์ที่จะเก็บข้อมูล (กด Enter เพื่อใช้ 'data.txt'):");
    let output_file = {
        let input = read_input()?;
        if input.trim().is_empty() {
            "data.txt".to_string()
        } else {
            input
        }
    };

    // ระยะเวลาดึงข้อมูล
    println!("\n⏱️  ดึงข้อมูลทุกกี่วินาที? (กด Enter เพื่อใช้ 60 วินาที):");
    let fetch_interval_seconds = {
        let input = read_input()?;
        if input.trim().is_empty() {
            60
        } else {
            input.parse().unwrap_or(60)
        }
    };

    let config = Config {
        api_url,
        output_file: output_file.clone(),
        fetch_interval_seconds,
        selected_fields,
        unique_key,
        data_path,
    };

    println!("\n========================================");
    println!("✨ เริ่มดึงข้อมูลอัตโนมัติ...");
    println!("📍 API: {}", config.api_url);
    println!("💾 ไฟล์: {}", config.output_file);
    println!("⏱️  ทุก {} วินาที", config.fetch_interval_seconds);
    println!("🔑 Unique Key: {}", config.unique_key);
    if !config.data_path.is_empty() {
        println!("📂 Data Path: {}", config.data_path.join("."));
    }
    println!("========================================\n");

    // โหลดข้อมูลเดิม
    let mut fetched_keys = load_fetched_keys(&output_file, &config.unique_key)?;
    println!("📂 โหลดข้อมูลเดิม: พบ {} รายการ", fetched_keys.len());

    let mut fetch_count = 0;

    loop {
        fetch_count += 1;
        println!("\n🔄 รอบที่ {}: กำลังดึงข้อมูล...", fetch_count);

        match fetch_data(&config.api_url, &config.data_path).await {
            Ok(items) => {
                let mut new_items_count = 0;

                for item in items {
                    // ดึงค่า unique key
                    let key_value = match extract_key_value(&item, &config.unique_key) {
                        Some(v) => v,
                        None => {
                            eprintln!("⚠️  ไม่พบ key '{}' ในข้อมูล", config.unique_key);
                            continue;
                        }
                    };

                    // ตรวจสอบว่าดึงมาแล้วหรือยัง
                    if !fetched_keys.contains(&key_value) {
                        // กรองเฉพาะฟิลด์ที่เลือก
                        let filtered_item = filter_fields(&item, &config.selected_fields);

                        // บันทึกลงไฟล์
                        if let Err(e) = save_to_file(&filtered_item, &output_file) {
                            eprintln!("❌ Error saving item: {}", e);
                            continue;
                        }

                        // เพิ่มเข้า HashSet
                        fetched_keys.insert(key_value.clone());
                        new_items_count += 1;

                        // แสดงข้อมูลย่อ
                        let preview = get_preview(&filtered_item);
                        println!("  ✅ เพิ่มข้อมูล [{}]: {}", key_value, preview);
                    }
                }

                if new_items_count == 0 {
                    println!("  ℹ️  ไม่มีข้อมูลใหม่");
                } else {
                    println!("  📝 เพิ่มข้อมูลใหม่: {} รายการ", new_items_count);
                }

                println!("  📊 ข้อมูลทั้งหมด: {} รายการ", fetched_keys.len());
            }
            Err(e) => {
                eprintln!("❌ เกิดข้อผิดพลาดในการดึงข้อมูล: {}", e);
            }
        }

        // รอตามระยะเวลาที่กำหนด
        println!("⏳ รอ {} วินาที... (กด Ctrl+C เพื่อหยุด)", config.fetch_interval_seconds);
        sleep(Duration::from_secs(config.fetch_interval_seconds)).await;
    }
}

// อ่าน input จากผู้ใช้
fn read_input() -> io::Result<String> {
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    Ok(input.trim().to_string())
}

// อ่านตัวเลขจากผู้ใช้
fn read_number(min: usize, max: usize) -> io::Result<usize> {
    loop {
        let input = read_input()?;
        match input.parse::<usize>() {
            Ok(num) if num >= min && num <= max => return Ok(num),
            _ => println!("❌ กรุณาใส่ตัวเลข {}-{}: ", min, max),
        }
    }
}

// ดึง JSON ดิบจาก API
async fn fetch_raw_json(api_url: &str) -> Result<Value, Box<dyn std::error::Error>> {
    let response = reqwest::get(api_url).await?;

    if !response.status().is_success() {
        return Err(format!("API returned status: {}", response.status()).into());
    }

    let data: Value = response.json().await?;
    Ok(data)
}

// แสดง structure ของ JSON
fn display_structure(value: &Value, indent: usize) {
    let prefix = "  ".repeat(indent);
    
    match value {
        Value::Object(map) => {
            for (key, val) in map.iter().take(5) { // แสดงแค่ 5 key แรก
                match val {
                    Value::Array(arr) => {
                        println!("{}{}: Array[{}]", prefix, key, arr.len());
                        if !arr.is_empty() {
                            display_structure(&arr[0], indent + 1);
                        }
                    }
                    Value::Object(_) => {
                        println!("{}{}: Object", prefix, key);
                        display_structure(val, indent + 1);
                    }
                    _ => {
                        let preview = format!("{}", val);
                        let preview_short = if preview.len() > 50 {
                            format!("{}...", &preview[..50])
                        } else {
                            preview
                        };
                        println!("{}{}: {}", prefix, key, preview_short);
                    }
                }
            }
            if map.len() > 5 {
                println!("{}... และอีก {} ฟิลด์", prefix, map.len() - 5);
            }
        }
        Value::Array(arr) => {
            println!("{}Array[{}]", prefix, arr.len());
            if !arr.is_empty() {
                display_structure(&arr[0], indent + 1);
            }
        }
        _ => {}
    }
}

// ดึงข้อมูลจาก nested path
fn extract_data_from_path(
    value: &Value,
    path: &[String],
) -> Result<Vec<Value>, Box<dyn std::error::Error>> {
    let mut current = value;

    // ไล่ตาม path
    for segment in path {
        current = current
            .get(segment)
            .ok_or(format!("ไม่พบ key '{}' ในข้อมูล", segment))?;
    }

    // ถ้าเป็น array ให้ return เลย
    if let Some(array) = current.as_array() {
        return Ok(array.clone());
    }

    // ถ้าเป็น object ให้ห่อใน array
    Ok(vec![current.clone()])
}

// ดึงข้อมูลจาก API พร้อม extract ตาม path
async fn fetch_data(
    api_url: &str,
    data_path: &[String],
) -> Result<Vec<Value>, Box<dyn std::error::Error>> {
    let raw_json = fetch_raw_json(api_url).await?;
    extract_data_from_path(&raw_json, data_path)
}

// ดึงรายชื่อฟิลด์ทั้งหมดจาก JSON object
fn extract_fields(data: &Value) -> Vec<String> {
    if let Some(obj) = data.as_object() {
        return obj.keys().cloned().collect();
    }
    Vec::new()
}

// ดึง preview ค่าของฟิลด์
fn get_field_preview(data: &Value, field: &str) -> String {
    if let Some(value) = data.get(field) {
        let str_val = match value {
            Value::String(s) => s.clone(),
            _ => value.to_string(),
        };
        if str_val.len() > 30 {
            format!("{}...", &str_val[..30])
        } else {
            str_val
        }
    } else {
        "N/A".to_string()
    }
}

// ดึงค่า key จากข้อมูล
fn extract_key_value(data: &Value, key: &str) -> Option<String> {
    data.get(key).and_then(|v| {
        match v {
            Value::String(s) => Some(s.clone()),
            Value::Number(n) => Some(n.to_string()),
            Value::Bool(b) => Some(b.to_string()),
            _ => Some(v.to_string()),
        }
    })
}

// กรองเฉพาะฟิลด์ที่เลือก
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

// สร้าง preview ข้อมูลสั้นๆ
fn get_preview(data: &Value) -> String {
    if let Some(obj) = data.as_object() {
        let preview: Vec<String> = obj
            .iter()
            .take(2)
            .map(|(k, v)| {
                let v_str = match v {
                    Value::String(s) => s.chars().take(30).collect::<String>(),
                    _ => v.to_string().chars().take(30).collect::<String>(),
                };
                format!("{}: {}", k, v_str)
            })
            .collect();
        return preview.join(", ");
    }
    "".to_string()
}

// บันทึกข้อมูลลงไฟล์
fn save_to_file(item: &Value, filename: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(filename)?;

    let json_line = serde_json::to_string(item)?;
    writeln!(file, "{}", json_line)?;

    Ok(())
}

// โหลด key ที่ดึงมาแล้วจากไฟล์
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
