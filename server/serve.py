# SERVER LOGIC GOES HERE
import geokit as gk
from os.path import dirname, splitext, join, basename, isfile
import pandas as pd
from datetime import datetime as dt

DATADIR = join(dirname(__file__), "static", "datafiles")
TOPODIR = join(dirname(__file__), "static", "topofiles")

from flask import Flask, render_template, redirect, request, abort
app = Flask(__name__)
from landplan.landplan import vectorFrameToTopoJson


@app.route('/')
def index():
    mapName = request.args.get("topo", "deu_adm2")

    # return redirect("/static/app.html")
    return render_template('base.html', topo=mapName, colorby="_index")

@app.route("/read/<path:subpath>")
def readdata(subpath): 

    fullPath = join(DATADIR, subpath)
    try:
        ext = splitext(fullPath)[1]
        if ext==".csv": data = pd.read_csv(fullPath)
        elif ext==".xls" or ext==".xlsx": data = pd.read_excel(fullPath)
        else: return render_template('404.html'), 404

        json = data.fillna('').T.to_json()

        return json
    except Exception as e:
        print(dt.now(), ": Error with input '%s'"%subpath)
        print(e)
        return render_template('404.html'), 404

@app.route("/map/<toponame>/")
@app.route("/map/<toponame>/<path:datapath>")
def makemap(toponame, datapath=False):
    colorby = request.args.get("colorby", "_index")
    return render_template('base.html', topo=toponame, colorby=colorby, data=datapath)     

if __name__ == "__main__":
    app.run(port=3035, host="0.0.0.0")
