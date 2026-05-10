import cv2
import numpy as np


class GstWarpCrop:
    def __init__(self, margin=0.15):
        self.margin = margin

    def process(self, frame, H):
        """
        입력:
            frame: BGR 이미지
            H: 3x3 homography
        출력:
            stabilized frame
        """

        h, w = frame.shape[:2]

        # 1. warp
        warped = cv2.warpPerspective(frame, H, (w, h))

        # 2. crop
        crop_x = int(w * self.margin / 2)
        crop_y = int(h * self.margin / 2)
        crop_w = w - crop_x * 2
        crop_h = h - crop_y * 2

        cropped = warped[crop_y:crop_y + crop_h, crop_x:crop_x + crop_w]

        output_h, output_w = h // 2, w // 2
        final = cv2.resize(cropped, (output_w, output_h))

        return final