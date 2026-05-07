from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from labs_generated import labs

app = FastAPI(title="Frontend Labs — Python")


@app.get("/")
def root():
    return HTMLResponse('<html><body><a href="/labs/python">Python Labs</a></body></html>')


@app.get("/labs/python")
def lab_index():
    links = "".join(
        f'<li><a href="{lab["route"]}">{lab["title"]}</a></li>'
        for lab in labs
    )
    return HTMLResponse(f"""<html><body>
<main style="padding:24px;font-family:system-ui,sans-serif">
  <h1>Frontend Labs — Python</h1>
  <p>Select a lab.</p>
  <ul>{links}</ul>
</main>
</body></html>""")


def _make_handler(lab):
    def handler():
        content = lab["setup"]()
        return HTMLResponse(f"<html><body>{content}</body></html>")
    return handler


for _lab in labs:
    app.add_api_route(_lab["route"], _make_handler(_lab), methods=["GET"])
