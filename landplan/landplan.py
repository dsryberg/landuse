# PROCESSING LOGIC GOES HERE
import topojson
from io import BytesIO, TextIOWrapper
import geokit as gk

def vectorFrameToTopoJson(vec):
    
    # Create geoJson
    o = BytesIO()
    # o='deleteme.json'
    gk.vector.createGeoJson(v, output=o)
    o.seek(0)

    # create topoJson
    topo = topojson.conversion.convert( TextIOWrapper(o) )
    o.close()
    
    # done!
    return str(topo)