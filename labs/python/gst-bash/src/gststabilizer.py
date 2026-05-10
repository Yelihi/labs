import cv2
import numpy as np


class GstStabilizer:
    def __init__(self, downsample=4, lookahead=5):
        self.downsample = downsample
        self.lookahead = lookahead

        self.prev_frame = None
        self.motion_history = []
        self.smooth_trajectory = None  # S_t

    def process_frame(self, frame):
        """
        입력: frame (BGR)
        출력: (H, confidence)
        """

        if self.prev_frame is None:
            self.prev_frame = frame
            return np.eye(3), 1.0

        H, confidence = self.estimate_homography(self.prev_frame, frame)

        # 히스토리 저장
        self.motion_history.append((H, confidence))
        if len(self.motion_history) > self.lookahead:
            self.motion_history.pop(0)

        smoothed_H = self.compute_smooth_trajectory(H)

        self.prev_frame = frame.copy()

        return smoothed_H, confidence

    def estimate_homography(self, prev_frame, curr_frame):
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)

        h, w = prev_gray.shape
        ds = self.downsample

        prev_down = cv2.resize(prev_gray, (w // ds, h // ds))
        curr_down = cv2.resize(curr_gray, (w // ds, h // ds))

        orb = cv2.ORB_create(nfeatures=5000)

        kp1, des1 = orb.detectAndCompute(prev_down, None)
        kp2, des2 = orb.detectAndCompute(curr_down, None)

        if des1 is None or des2 is None or len(kp1) < 4 or len(kp2) < 4:
            return np.eye(3), 0.0

        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)

        if len(matches) < 4:
            return np.eye(3), 0.0

        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

        H_down, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        if H_down is None:
            return np.eye(3), 0.0

        inliers = np.sum(mask)
        confidence = min(1.0, inliers / len(matches))

        scale_matrix = np.array([
            [ds, 0, 0],
            [0, ds, 0],
            [0, 0, 1]
        ])

        H = np.linalg.inv(scale_matrix) @ H_down @ scale_matrix

        return H, confidence

    def wrap_and_crop(self, frame, H, margin=0.15):
        h, w = frame.shape[:2]

        warped = cv2.warpPerspective(frame, H, (w, h))

        crop_x = int(w * margin / 2)
        crop_y = int(h * margin / 2)
        crop_w = w - crop_x * 2
        crop_h = h - crop_y * 2

        cropped = warped[crop_y:crop_y + crop_h, crop_x:crop_x + crop_w]

        output_h, output_w = h // 2, w // 2
        final = cv2.resize(cropped, (output_w, output_h))

        return final



    def compute_smooth_trajectory(self, H):
        if len(self.motion_history) == 0:
            return H

        # 단순 평균 (블로그 방식 유지)
        avg_H = np.mean([h for h, _ in self.motion_history], axis=0)

        return avg_H