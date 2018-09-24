# SERVER LOGIC GOES HERE
import geokit as gk

from flask import Flask, render_template, redirect, request
app = Flask(__name__)
from landplan.landplan import vectorFrameToTopoJson

@app.route('/')
def index():
    mapName = request.args.get("topo", "deu_adm2")
    print(list(request.args.keys()), mapName)

    # return redirect("/static/app.html")
    return render_template('base.html', name="Land Plan", topo=mapName)

@app.route('/aachen')
def getAachen():
    # FILE="/home/sev/fzj-repos/data/region/gadm/DEU_adm1.shp"
    FILE=gk._test_data_["aachenShapefile.shp"]
    # FILE=gk._test_data_["aachen_buildings.shp"]
    vec = gk.vector.extractFeatures(FILE)
    json = gk.vector.createGeoJson(vec)

    return json

@app.route('/deu')
def getDEU():
    FILE="/home/sev/fzj-repos/data/region/gadm/DEU_adm1.shp"
    vec = gk.vector.extractFeatures(FILE)
    vec.geom = [g.SimplifyPreserveTopology(0.01) for g in vec.geom]
    json = gk.vector.createGeoJson(vec)

    return json

@app.route('/topodeu')
def getTopoDEU():
    FILE="/home/sev/fzj-repos/data/region/gadm/DEU_adm1.shp"
    # FILE=gk._test_data_["aachenShapefile.shp"]
    # topo = vectorFrameToTopoJson(FILE)
    vec = gk.vector.extractFeatures(FILE)
    vec.geom = [g.SimplifyPreserveTopology(0.001) for g in vec.geom]
    return gk.vector.createGeoJson(vec, topo=True)

@app.route('/topodeu2')
def getTopoDEU2():
    FILE="/home/sev/fzj-repos/data/region/gadm/DEU_adm2.shp"
    # FILE=gk._test_data_["aachenShapefile.shp"]
    # topo = vectorFrameToTopoJson(FILE)
    vec = gk.vector.extractFeatures(FILE)
    # vec.geom = [g.SimplifyPreserveTopology(0.001) for g in vec.geom]
    return gk.vector.createGeoJson(vec, topo=True)

@app.route('/topoaachen')
def getTopoAachen():
    FILE=gk._test_data_["aachenShapefile.shp"]

    vec = gk.vector.extractFeatures(FILE)
    return gk.vector.createGeoJson(vec, topo=True)

if __name__ == "__main__":
    app.run(port=3035, host="0.0.0.0")
