from PIL import Image
import sys

try:
    img = Image.open('public/logo.png')
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # Check if there are actually transparent pixels
        extrema = img.getextrema()
        if img.mode == 'RGBA':
            alpha_extrema = extrema[3]
            if alpha_extrema[0] < 255:
                print("Transparent: Yes")
            else:
                print("Transparent: No (Alpha channel exists but full opaque)")
        else:
             print("Transparent: Maybe (Palette/LA)")
    else:
        print("Transparent: No (No alpha channel)")
except Exception as e:
    print(f"Error: {e}")
