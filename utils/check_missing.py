import csv

def analyze_missing(file_path):
    print(f"Analyzing {file_path}...")
    try:
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            data = list(reader)
            
        if not data:
            print("No data found.")
            return

        total_rows = len(data)
        print(f"Total Rows: {total_rows}")
        
        headers = data[0].keys()
        missing_counts = {header: 0 for header in headers}
        
        missing_keywords = ['nan', 'none', 'null', 'missing', '']
        
        for row in data:
            for key, value in row.items():
                if value is None:
                    missing_counts[key] += 1
                elif str(value).strip().lower() in missing_keywords:
                    missing_counts[key] += 1
                    
        print("\nMissing Values per Column:")
        for key, count in missing_counts.items():
            if count > 0:
                print(f"{key}: {count} ({count/total_rows*100:.2f}%)")
            else:
                print(f"{key}: 0")
                
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_missing('dataset/merged_laptop_data_cleaned.csv')
