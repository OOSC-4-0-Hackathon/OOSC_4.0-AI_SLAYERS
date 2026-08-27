import os
import glob

def stitch_file(base_filepath):
    parts = sorted(glob.glob(f"{base_filepath}.part*"), key=lambda x: int(x.split('.part')[-1]))
    
    if not parts:
        print(f"No parts found for {base_filepath}")
        return
        
    print(f"Found {len(parts)} parts for {base_filepath}. Reconstructing...")
    
    with open(base_filepath, 'wb') as outfile:
        for part in parts:
            print(f"Appending {part}...")
            with open(part, 'rb') as infile:
                outfile.write(infile.read())
                
    print(f"Successfully reconstructed {base_filepath}!")

if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(__file__), 'chroma.sqlite3')
    if not os.path.exists(db_path):
        stitch_file(db_path)
    else:
        print(f"{db_path} already exists.")
