import zipfile, re

xlsx_path = r'd:\projects\Test Certificate Software\TEST CERTIFICATE CETIPL GIP MALL NOIDA.xlsx'

with zipfile.ZipFile(xlsx_path, 'r') as z:
    content = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
    
    # Get merge cells
    merges = re.findall(r'mergeCell ref="([^"]+)"', content)
    print('=== MERGE CELLS ===')
    for m in merges:
        print(f'  {m}')
    
    # Get column widths
    cols = re.findall(r'<col\s[^>]+>', content)
    print('\n=== COLUMNS ===')
    for c in cols:
        print(f'  {c}')
    
    # Count rows
    rows = re.findall(r'<row r="(\d+)"', content)
    if rows:
        print(f'\nTotal rows: {max(int(r) for r in rows)}')
