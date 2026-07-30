import os
from urllib.parse import quote
from urllib.request import urlopen, Request

script_dir = os.path.dirname(os.path.abspath(__file__))

base_url = 'https://skills.futuremem.swiss/de/assets/download'
files = [
    'export_lernfelder_BFS.xlsx',
    'export_lernfelder_%C3%BCK.xlsx',
    'export_umsetzung_BE.xlsx',
]

local_names = {
    'export_lernfelder_%C3%BCK.xlsx': 'export_lernfelder_üK.xlsx',
}

for url_name in files:
    url = f'{base_url}/{url_name}'
    out_name = local_names.get(url_name, url_name)
    out_path = os.path.join(script_dir, out_name)
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(req, timeout=30) as resp:
            data = resp.read()
        with open(out_path, 'wb') as f:
            f.write(data)
        print(f'Downloaded {out_name} ({len(data)} bytes)')
    except Exception as e:
        print(f'Failed {url}: {e}')
