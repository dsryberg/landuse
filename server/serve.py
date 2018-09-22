# SERVER LOGIC GOES HERE
import geokit as gk

from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('base.html', name="Land Plan")

@app.route('/getgeo')
def getGeo():
    # FILE="/home/sev/sandbox/1801_model_showcase/inputs/nrw.shp"
    FILE=gk._test_data_["aachenShapefile.shp"]
    # FILE=gk._test_data_["aachen_buildings.shp"]
    vec = gk.vector.extractFeatures(FILE)
    json = gk.vector.createGeoJson(vec)

    return json

if __name__ == "__main__":
    app.run(port=3035)
