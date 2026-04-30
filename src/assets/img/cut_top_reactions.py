from PIL import Image
import os


INPUT_IMAGE = "debug_top.png"
OUTPUT_DIR = "cut_assets/top_clean"
COLS = 5
ROWS = 2


def trim_top_object(cell, bg_threshold=245):
    rgb = cell.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()

    def is_fg(x, y):
        r, g, b = pixels[x, y]
        return r < bg_threshold or g < bg_threshold or b < bg_threshold

    row_counts = []
    for y in range(height):
        count = 0
        for x in range(width):
            if is_fg(x, y):
                count += 1
        row_counts.append(count)

    row_threshold = max(3, width // 80)
    started = False
    top = 0
    bottom = height - 1
    last_fg = 0
    blank_streak = 0

    for y, count in enumerate(row_counts):
        if count > row_threshold:
            if not started:
                top = y
                started = True
            last_fg = y
            blank_streak = 0
        elif started:
            blank_streak += 1
            if blank_streak >= 10:
                bottom = last_fg
                break
    else:
        if started:
            bottom = last_fg

    if not started:
        return cell

    left = width - 1
    right = 0
    for y in range(top, bottom + 1):
        for x in range(width):
            if is_fg(x, y):
                if x < left:
                    left = x
                if x > right:
                    right = x

    if left > right:
        return cell

    pad = 4
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(width, right + 1 + pad)
    bottom = min(height, bottom + 1 + pad)
    return cell.crop((left, top, right, bottom))


def main():
    img = Image.open(INPUT_IMAGE)
    width, height = img.size

    cell_w = width // COLS
    cell_h = height // ROWS

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    index = 0
    for row in range(ROWS):
        for col in range(COLS):
            cell = img.crop(
                (
                    col * cell_w,
                    row * cell_h,
                    (col + 1) * cell_w,
                    (row + 1) * cell_h,
                )
            )
            trimmed = trim_top_object(cell)
            trimmed.save(f"{OUTPUT_DIR}/reaction_{index}.png")
            index += 1

    print(f"Saved {index} reaction sprites to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
