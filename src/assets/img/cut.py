from PIL import Image
import os

image_path = "image.png"
img = Image.open(image_path)

img_width, img_height = img.size

# --- CALIBRATED ZONES (exclude the green title headers) ---
# These ratios match the layout of image.png:
# - reactions block (2 rows x 5)
# - candies block (2 rows x 7)
top_start = int(img_height * 0.12)
top_end = int(img_height * 0.59)
bottom_start = int(img_height * 0.66)
bottom_end = int(img_height * 0.98)

top_img = img.crop((0, top_start, img_width, top_end))
bottom_img = img.crop((0, bottom_start, img_width, bottom_end))

# Save debug images
top_img.save("debug_top.png")
bottom_img.save("debug_bottom.png")

# Create folders
os.makedirs("cut_assets/top", exist_ok=True)
os.makedirs("cut_assets/bottom", exist_ok=True)

# -------- CUT TOP (reactions) --------
cols_top = 5
rows_top = 2

top_w, top_h = top_img.size
cell_w = top_w // cols_top
cell_h = top_h // rows_top

count = 0
for r in range(rows_top):
    for c in range(cols_top):
        crop = top_img.crop((
            c * cell_w,
            r * cell_h,
            (c + 1) * cell_w,
            (r + 1) * cell_h
        ))
        crop.save(f"cut_assets/top/reaction_{count}.png")
        count += 1

# -------- CUT BOTTOM (candies) --------
cols_bot = 7
rows_bot = 2

bot_w, bot_h = bottom_img.size
cell_w = bot_w // cols_bot
cell_h = bot_h // rows_bot

count = 0
for r in range(rows_bot):
    for c in range(cols_bot):
        crop = bottom_img.crop((
            c * cell_w,
            r * cell_h,
            (c + 1) * cell_w,
            (r + 1) * cell_h
        ))
        crop.save(f"cut_assets/bottom/candy_{count}.png")
        count += 1

print("Done! Clean assets saved.")