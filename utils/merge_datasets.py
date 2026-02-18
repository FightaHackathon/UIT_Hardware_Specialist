import csv
import re
import os

def normalize_name(name):
    if not name:
        return ""
    return re.sub(r'[^a-zA-Z0-9]', '', name.lower())

def get_inferred_data(row):
    try:
        ram = int(row.get('ram(GB)', 0))
    except ValueError:
        ram = 0
    
    gpu = row.get('graphics', '').lower()
    cpu = row.get('processor_name', '').lower()
    
    # High Spec Logic
    is_high_spec = False
    if ram >= 16:
        is_high_spec = True
    if 'rtx' in gpu or 'gtx' in gpu or 'radeon rx' in gpu:
        is_high_spec = True
        
    # Mid Spec Logic
    is_mid_spec = ram >= 8
    
    if is_high_spec:
        major = "Knowledge Engineering"
        activities = "Programming/Coding (e.g., VS Code, IntelliJ, Python), Running Virtual Machines (e.g., VMware, VirtualBox), CAD/3D Modeling (e.g., AutoCAD, Blender), Graphic Design/Video Editing"
        program_list = "TensorFlow, PyTorch, Unity, Unreal Engine"
    elif is_mid_spec:
        major = "Software Engineering"
        activities = "Programming/Coding (e.g., VS Code, IntelliJ, Python), Web Browsing and Research, Office/Documentation (e.g., Word, Excel, Google Docs), Database Management"
        program_list = "VS Code, Git, Postman, XAMPP"
    else:
        major = "No Major Yet"
        activities = "Web Browsing and Research, Office/Documentation (e.g., Word, Excel, Google Docs)"
        program_list = "Chrome, Word, Excel"
        
    return {
        'Major': major,
        'Activities': activities,
        'ProgramList': program_list
    }

def main():
    laptop_file = 'dataset/laptop.csv'
    survey_file = 'dataset/UIT Student Laptop Usage Survey (Responses) - Form responses 1.csv'
    output_file = 'dataset/merged_laptop_data_cleaned.csv'
    
    # Check if files exist
    if not os.path.exists(laptop_file):
        print(f"Error: {laptop_file} not found.")
        return
    if not os.path.exists(survey_file):
        print(f"Error: {survey_file} not found.")
        return

    # Read Survey Data
    survey_data = []
    with open(survey_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map survey columns to simpler keys if needed or just store raw
            # The survey header for model is: "What is the laptop model you primarily use..."
            # We'll need to find the model column.
            # Based on inspection: "What is the laptop model you primarily use for your studies?(You can find your pc model in your system settings)"
            model_key = [k for k in row.keys() if 'laptop model' in k.lower()][0]
            major_key = [k for k in row.keys() if 'major' in k.lower()][0]
            activity_key = [k for k in row.keys() if 'activities' in k.lower()][0]
            program_list_key = [k for k in row.keys() if 'specialized software' in k.lower() and 'list' in k.lower()][0]
            
            survey_data.append({
                'model_normalized': normalize_name(row[model_key]),
                'Major': row[major_key],
                'Activities': row[activity_key],
                'ProgramList': row[program_list_key]
            })

    # Read Laptop Data and Merge
    merged_rows = []
    with open(laptop_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames + ['Major', 'Activities', 'ProgramList']
        
        for row in reader:
            laptop_model_norm = normalize_name(row['model_name'])
            
            # Clean and Fill Missing Hardware Data
            if not row.get('graphics') or row['graphics'] in ['Missing', 'NULL', 'null', 'None', '']:
                proc = row.get('processor_name', '').lower()
                if 'intel' in proc:
                    row['graphics'] = 'Intel Integrated Graphics'
                elif 'amd' in proc or 'ryzen' in proc:
                    row['graphics'] = 'AMD Radeon Graphics'
                else:
                    row['graphics'] = 'Integrated Graphics'

            if not row.get('screen_size(inches)') or row['screen_size(inches)'] in ['Missing', 'NULL', 'null', 'None', '']:
                row['screen_size(inches)'] = '15.6'
            
            if not row.get('resolution (pixels)') or row['resolution (pixels)'] in ['Missing', 'NULL', 'null', 'None', '']:
                row['resolution (pixels)'] = '1920 x 1080'

            # Find match
            match = None
            for survey_row in survey_data:
                # Simple fuzzy match: if survey model is contained in laptop model or vice versa
                if survey_row['model_normalized'] and (survey_row['model_normalized'] in laptop_model_norm or laptop_model_norm in survey_row['model_normalized']):
                    match = survey_row
                    break
            
            if match:
                row['Major'] = match['Major']
                row['Activities'] = match['Activities']
                row['ProgramList'] = match['ProgramList']
                
                # Fill missing ProgramList even if matched
                if not row['ProgramList'] or row['ProgramList'].lower() in ['none', 'nan', '']:
                     inferred = get_inferred_data(row)
                     row['ProgramList'] = inferred['ProgramList']
            else:
                inferred = get_inferred_data(row)
                row['Major'] = inferred['Major']
                row['Activities'] = inferred['Activities']
                row['ProgramList'] = inferred['ProgramList']
            
            merged_rows.append(row)

    # Write Output
    with open(output_file, mode='w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(merged_rows)

    print(f"Successfully merged data to {output_file}")

if __name__ == "__main__":
    main()
