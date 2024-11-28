import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM, XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { ScaleLine, defaults as defaultControls } from 'ol/control';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { LineString, Polygon } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';
import { unByKey } from 'ol/Observable';
import { Layers, Ruler, Pencil, Square, Trash2, Edit3, MousePointer, Printer } from 'lucide-react';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import Overlay from 'ol/Overlay';
// import PrintDialog from './PrintDialog';
// import { createMapImage, generateMapPDF } from '../utils/printMap';

const TORUN_COORDINATES = [18.598444, 53.013790];
const INITIAL_ZOOM = 12;

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const measureTooltipRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [measureType, setMeasureType] = useState<'none' | 'length' | 'area'>('none');
  const [drawType, setDrawType] = useState<'none' | 'polygon'>('none');
  const [baseLayer, setBaseLayer] = useState<'osm' | 'topo' | 'cat'>('osm');
  const [scale, setScale] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [mapPreviewUrl, setMapPreviewUrl] = useState('');
  
  const vectorSource = useRef(new VectorSource());
  const measureSource = useRef(new VectorSource());
  const drawInteraction = useRef<Draw | null>(null);
  const modifyInteraction = useRef<Modify | null>(null);
  const selectInteraction = useRef<Select | null>(null);
  const sketch = useRef<any>(null);
  const measureTooltipElement = useRef<HTMLDivElement | null>(null);
  const measureTooltip = useRef<Overlay | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const layers = {
      osm: new TileLayer({ 
        source: new OSM()
      }),
      topo: new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attributions: '© <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        })
      }),
      cat: new TileLayer({
        source: new XYZ({
          url: 'https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png',
          attributions: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      })
    };

    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
      style: new Style({
        fill: new Fill({ color: 'rgba(34, 197, 94, 0.2)' }),
        stroke: new Stroke({ color: '#16a34a', width: 2 }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({ color: '#16a34a', width: 2 })
        })
      })
    });

    const measureLayer = new VectorLayer({
      source: measureSource.current,
      style: (feature) => {
        const geometry = feature.getGeometry();
        let measurement = feature.get('measurement');
        
        return new Style({
          fill: new Fill({ color: 'rgba(34, 197, 94, 0.2)' }),
          stroke: new Stroke({ color: '#16a34a', width: 2 }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({ color: '#16a34a' }),
            fill: new Fill({ color: 'white' })
          }),
          text: measurement ? new Text({
            text: measurement,
            font: '14px sans-serif',
            fill: new Fill({ color: '#16a34a' }),
            stroke: new Stroke({ color: 'white', width: 3 }),
            offsetY: -15
          }) : undefined
        });
      }
    });

    const initialMap = new Map({
      target: mapRef.current,
      layers: [layers[baseLayer], vectorLayer, measureLayer],
      controls: defaultControls().extend([new ScaleLine()]),
      view: new View({
        center: fromLonLat(TORUN_COORDINATES),
        zoom: INITIAL_ZOOM,
        extent: fromLonLat([18.4, 52.9]).concat(fromLonLat([18.8, 53.1]))
      })
    });

    setMap(initialMap);

    initialMap.on('moveend', () => {
      const view = initialMap.getView();
      const resolution = view.getResolution();
      if (resolution) {
        const dpi = 25.4 / 0.28;
        const mpu = initialMap.getView().getProjection().getMetersPerUnit();
        const scale = resolution * mpu * 39.37 * dpi;
        setScale(`1:${Math.round(scale)}`);
      }
    });

    const updateMapSize = () => {
      initialMap.updateSize();
    };

    window.addEventListener('resize', updateMapSize);
    return () => {
      window.removeEventListener('resize', updateMapSize);
      initialMap.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    const layers = map.getLayers();
    layers.getArray()[0].setSource(
      baseLayer === 'osm' ? new OSM() :
      baseLayer === 'topo' ? new XYZ({
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions: '© <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      }) :
      new XYZ({
        url: 'https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png',
        attributions: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    );
  }, [baseLayer, map]);

  const formatLength = (line: LineString) => {
    const length = getLength(line);
    return `${Math.round(length)} m`;
  };

  const formatArea = (polygon: Polygon) => {
    const area = getArea(polygon);
    return `${Math.round(area)} m²`;
  };

  const addMeasureInteraction = (type: 'length' | 'area') => {
    if (!map) return;
    
    removeMeasureInteraction();
    removeDrawInteraction();
    removeSelectInteraction();
    removeModifyInteraction();

    const drawType = type === 'length' ? 'LineString' : 'Polygon';
    drawInteraction.current = new Draw({
      source: measureSource.current,
      type: drawType,
      style: new Style({
        fill: new Fill({ color: 'rgba(34, 197, 94, 0.2)' }),
        stroke: new Stroke({ color: '#16a34a', width: 2 }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({ color: '#16a34a' }),
          fill: new Fill({ color: 'white' })
        })
      })
    });

    map.addInteraction(drawInteraction.current);

    drawInteraction.current.on('drawstart', (evt) => {
      measureSource.current.clear();
      sketch.current = evt.feature;

      let measurement = '';
      const updateMeasurement = (geom: any) => {
        if (geom instanceof LineString) {
          measurement = formatLength(geom);
        } else if (geom instanceof Polygon) {
          measurement = formatArea(geom);
        }
        sketch.current.set('measurement', measurement);
      };

      sketch.current.getGeometry().on('change', (evt: any) => {
        updateMeasurement(evt.target);
      });
    });

    drawInteraction.current.on('drawend', () => {
      sketch.current = null;
    });
  };

  const addDrawInteraction = () => {
    if (!map) return;
    
    removeMeasureInteraction();
    removeDrawInteraction();
    removeSelectInteraction();
    removeModifyInteraction();

    drawInteraction.current = new Draw({
      source: vectorSource.current,
      type: 'Polygon'
    });

    map.addInteraction(drawInteraction.current);
  };

  const addSelectInteraction = () => {
    if (!map) return;

    removeMeasureInteraction();
    removeDrawInteraction();
    removeSelectInteraction();
    removeModifyInteraction();

    selectInteraction.current = new Select({
      style: new Style({
        fill: new Fill({ color: 'rgba(34, 197, 94, 0.3)' }),
        stroke: new Stroke({ color: '#16a34a', width: 2, lineDash: [5, 5] }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({ color: '#16a34a', width: 2 })
        })
      })
    });

    map.addInteraction(selectInteraction.current);
    setIsSelecting(true);
  };

  const addModifyInteraction = () => {
    if (!map) return;

    removeDrawInteraction();
    removeMeasureInteraction();

    if (!selectInteraction.current) {
      selectInteraction.current = new Select({
        style: new Style({
          fill: new Fill({ color: 'rgba(34, 197, 94, 0.3)' }),
          stroke: new Stroke({ color: '#16a34a', width: 2 }),
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({ color: '#16a34a', width: 2 })
          })
        })
      });
      map.addInteraction(selectInteraction.current);
    }

    if (!modifyInteraction.current) {
      modifyInteraction.current = new Modify({
        features: selectInteraction.current.getFeatures()
      });
      map.addInteraction(modifyInteraction.current);
    }

    setIsEditing(true);
    setIsSelecting(true);
  };

  const removeMeasureInteraction = () => {
    if (map && drawInteraction.current) {
      map.removeInteraction(drawInteraction.current);
      drawInteraction.current = null;
      measureSource.current.clear();
    }
  };

  const removeDrawInteraction = () => {
    if (map) {
      if (drawInteraction.current) {
        map.removeInteraction(drawInteraction.current);
        drawInteraction.current = null;
      }
    }
  };

  const removeSelectInteraction = () => {
    if (map && selectInteraction.current) {
      map.removeInteraction(selectInteraction.current);
      selectInteraction.current = null;
      setIsSelecting(false);
    }
  };

  const removeModifyInteraction = () => {
    if (map && modifyInteraction.current) {
      map.removeInteraction(modifyInteraction.current);
      modifyInteraction.current = null;
      setIsEditing(false);
    }
  };

  const deleteSelectedFeature = () => {
    if (selectInteraction.current) {
      const selectedFeatures = selectInteraction.current.getFeatures();
      selectedFeatures.forEach((feature) => {
        vectorSource.current.removeFeature(feature);
      });
      selectedFeatures.clear();
    }
  };

  const handleMeasureClick = (type: 'none' | 'length' | 'area') => {
    setMeasureType(type);
    setDrawType('none');
    if (type === 'none') {
      removeMeasureInteraction();
    } else {
      addMeasureInteraction(type);
    }
  };

  const handleDrawClick = (type: 'none' | 'polygon') => {
    setDrawType(type);
    setMeasureType('none');
    if (type === 'none') {
      removeDrawInteraction();
    } else {
      addDrawInteraction();
    }
  };

  // const handlePrintClick = () => {
  //   if (map) {
  //     const imageUrl = createMapImage(map);
  //     setMapPreviewUrl(imageUrl);
  //     setIsPrintDialogOpen(true);
  //   }
  // };

  // const handlePrintConfirm = () => {
  //   generateMapPDF(mapPreviewUrl);
  //   setIsPrintDialogOpen(false);
  // };

  return (
    <div className="relative h-[calc(100vh-40px)] w-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Toolbar */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <div className="flex flex-col gap-2 border-b pb-2">
          <Tippy content="Pomiar odległości">
            <button
              onClick={() => handleMeasureClick(measureType === 'length' ? 'none' : 'length')}
              className={`p-2 rounded-lg ${
                measureType === 'length' ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Ruler className="w-5 h-5" />
            </button>
          </Tippy>
          <Tippy content="Pomiar powierzchni">
            <button
              onClick={() => handleMeasureClick(measureType === 'area' ? 'none' : 'area')}
              className={`p-2 rounded-lg ${
                measureType === 'area' ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Square className="w-5 h-5" />
            </button>
          </Tippy>
        </div>

        <div className="flex flex-col gap-2 border-b pb-2">
          <Tippy content="Rysuj poligon">
            <button
              onClick={() => handleDrawClick(drawType === 'polygon' ? 'none' : 'polygon')}
              className={`p-2 rounded-lg ${
                drawType === 'polygon' ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Pencil className="w-5 h-5" />
            </button>
          </Tippy>
          <Tippy content="Zaznacz obiekt">
            <button
              onClick={() => isSelecting ? removeSelectInteraction() : addSelectInteraction()}
              className={`p-2 rounded-lg ${
                isSelecting ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <MousePointer className="w-5 h-5" />
            </button>
          </Tippy>
          <Tippy content="Edytuj poligon">
            <button
              onClick={() => isEditing ? removeModifyInteraction() : addModifyInteraction()}
              className={`p-2 rounded-lg ${
                isEditing ? 'bg-green-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </Tippy>
          <Tippy content="Usuń zaznaczony obiekt">
            <button
              onClick={deleteSelectedFeature}
              className="p-2 rounded-lg hover:bg-gray-100"
              disabled={!isSelecting}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </Tippy>
        </div>

        <div className="flex flex-col gap-2 border-b pb-2">
          <Tippy content="Zmień warstwę mapy">
            <button
              onClick={() => setBaseLayer(baseLayer === 'osm' ? 'topo' : baseLayer === 'topo' ? 'cat' : 'osm')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Layers className="w-5 h-5" />
            </button>
          </Tippy>
          {/* <Tippy content="Drukuj mapę">
            <button
              onClick={handlePrintClick}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Printer className="w-5 h-5" />
            </button>
          </Tippy> */}
        </div>
      </div>

      {/* Scale display */}
      <div className="absolute bottom-8 right-4 bg-white px-4 py-2 rounded-lg shadow-lg" style={{ marginBottom: '7.5px' }}>
        <span className="text-sm font-medium">Skala: {scale}</span>
      </div>

      {/* <PrintDialog
        isOpen={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        onPrint={handlePrintConfirm}
        previewUrl={mapPreviewUrl}
      /> */}
    </div>
  );
}