# PROCESSING LOGIC GOES HERE
import topojson
from io import BytesIO, TextIOWrapper
import geokit as gk

def vectorFrameToTopoJson(file):
    vec = gk.vector.extractFeatures(file)
    vec.geom = [g.SimplifyPreserveTopology(0.001) for g in vec.geom]

    # Create geoJson
    o = BytesIO()
    # o='deleteme.json'
    gk.vector.createGeoJson(vec.fillna(''), output=o)
    o.seek(0)

    # create topoJson
    topo = topojson.conversion.convert( TextIOWrapper(o), object_name="primary" )
    o.close()
    
    # done!
    return str(topo).replace("'",'"')