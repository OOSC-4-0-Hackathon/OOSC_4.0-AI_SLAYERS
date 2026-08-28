import os

CHUNK_SIZE = 90 * 1024 * 1024  # 90 MB

def split_file(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return
        
    file_size = os.path.getsize(filepath)
    print(f"Splitting {filepath} ({file_size} bytes) into {CHUNK_SIZE} byte chunks...")
    
    with open(filepath, 'rb') as f:
        part_num = 1
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            part_name = f"{filepath}.part{part_num}"
            with open(part_name, 'wb') as p:
                p.write(chunk)
            print(f"Created {part_name}")
            part_num += 1
            
    print("Done splitting!")

if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(__file__), 'chroma.sqlite3')
    split_file(db_path)
