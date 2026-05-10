import cv2
import sys
import os

gst_path = "/Library/Frameworks/GStreamer.framework/Versions/1.0/lib/python3.9/site-packages"
if gst_path not in sys.path:
    sys.path.insert(0, gst_path)

import gi
gi.require_version("Gst", "1.0")
from gi.repository import Gst, GLib

# 현재 폴더를 sys.path에 추가하여 로컬 모듈(gststabilizer 등)을 import 할 수 있게 합니다.
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from gststabilizer import GstStabilizer
from gstwarpcrop import GstWarpCrop


def create_stabilizer_pipeline():
    Gst.init(None)
    
    pipeline = Gst.Pipeline.new("stabilizer-pipeline")
    
    # 요소 생성
    source = Gst.ElementFactory.make("filesrc", "source")
    decoder = Gst.ElementFactory.make("decodebin", "decoder")
    encoder = Gst.ElementFactory.make("x264enc", "encoder")
    stabilizer = Gst.ElementFactory.make("gststabilizer", "stabilizer")
    sink = Gst.ElementFactory.make("filesink", "sink")
    
    if not all([source, decoder, encoder, sink]):
        print("Failed to create elements")
        return None
    
    # 속성 설정
    source.set_property("location", "samples/input.mp4")
    sink.set_property("location", "outputs/stabilized.avi")
    
    # 파이프라인에 추가
    pipeline.add(source, decoder, encoder, sink)
    
    # 링크 (실제로는 더 많은 캡스 필터링 필요)
    source.link(decoder)
    decoder.link(encoder)
    encoder.link(sink)
    
    return pipeline



def run(input_path, output_path):
    cap = cv2.VideoCapture(input_path)

    stabilizer = GstStabilizer()
    warper = GstWarpCrop()

    writer = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        H, confidence = stabilizer.process_frame(frame)
        output = warper.process(frame, H)
        output_path = "outputs/stabilized.avi"

        if writer is None:
            h, w = output.shape[:2]
            writer = cv2.VideoWriter(
                output_path,
                cv2.VideoWriter_fourcc(*"MJPG"),
                30,
                (w, h)
            )

            print("writer opened:", writer.isOpened())
        

        writer.write(output)

        print(f"confidence: {confidence:.3f}")

    cap.release()
    writer.release()


if __name__ == "__main__":
    run('samples/input.mp4', 'outputs/stabilized.avi')