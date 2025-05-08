import React from 'react';
import cytoscape from 'cytoscape';
import CyComp from 'react-cytoscapejs';
import fcose from 'cytoscape-fcose';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { IconContext } from 'react-icons';
import { FaImage, FaCircle } from 'react-icons/fa';
import { env } from '../../env';
import FileSaver from 'file-saver';
import { useState, useEffect } from 'react';
import './Visualization.scss';

cytoscape.use(fcose);

let cyRef;
const tdata = JSON.parse(localStorage.getItem("resultid"));
const params = JSON.parse(localStorage.getItem("param"));

// Define Mappings outside component for clarity
const speciesColorMap = {
  taestivum: '#19b944', // Host color
  pstrs: '#ef2c2c',     // Pathogen 1 color
  pstr78s: '#3498db',   // Pathogen 2 color (Example: Blue)
  pstr130s: '#f39c12', // Pathogen 3 color (Example: Orange)
  unknown: '#808080'    // Fallback color
};

const speciesNameMapping = {
  taestivum: <span>Wheat Protein</span>, // Not strictly needed for legend but good practice
  pstrs: <span><i>P. striiformis</i></span>,
  pstr78s: <span><i>P. striiformis</i> strain 78</span>,
  pstr130s: <span><i>P. striiformis</i> strain 130</span>,
};

export const Visualization = React.memo(props => {

  let [data, setData] = useState([]);
  let [graphData, setGraphData] = useState([]);
  let [searchTerm, setSearchTerm] = useState(props.searchTerm);
  let [colorBy, setColorBy] = useState('intdb');
  let [pathogenSpeciesFound, setPathogenSpeciesFound] = useState([]); // State for found pathogen species

  let layout = {
    name: 'random'
  }

  useEffect(() => {
    setSearchTerm(searchTerm);
    const fetchData = async () => {
      if (params.category === 'domain') {
        const domainData = JSON.parse(localStorage.getItem("data"));
        setData(domainData);
        setGraphData(domainData);
      } else {
        const url = `${env.BACKEND}/api/network/?results=${tdata}`;
        const results = await axios.get(url);
        setData(results);
        setGraphData(results.data.results);
      }
    }

    fetchData();
  }, [searchTerm]);

  let elements = [];

  let uniqueHost_Proteins;
  let uniquePatProteins;

  let hpidbs = [];
  let mints = [];
  let intacts = [];
  let dips = [];
  let biogrids = [];
  let arabihpis = [];
  let did3s = [];
  let iddis = [];
  let domines = [];

  let methodDict = {};
  let proteinToSpecies = {}; // Map protein ID to species code

  let domDict = { "3did": did3s, "iddi": iddis, "domine": domines };
  let intDict = { "hpidb": hpidbs, "mint": mints, "intact": intacts, "dip": dips, "arabihpi": arabihpis, "biogrid": biogrids };

  if (graphData.length && data) {
    let useData = graphData;
    methodDict = {};
    proteinToSpecies = {}; // Reset protein species map
    hpidbs = []; mints = []; intacts = []; dips = []; biogrids = []; arabihpis = [];
    did3s = []; iddis = []; domines = [];

    elements = useData.map(item => {
      let id = '';
      let dbKey = '';
      let methodKey = item.Method || 'Unknown';
      let currentSpecies = item.species || 'unknown'; // Get pathogen species for this interaction

      // --- Populate proteinToSpecies map ---
      proteinToSpecies[item.Host_Protein] = 'taestivum'; // Assume host is always wheat
      proteinToSpecies[item.Pathogen_Protein] = currentSpecies;

      if ('intdb_x' in item && 'intdb' in item) {
        dbKey = item.intdb_x.toLowerCase() + '_' + item.intdb.toLowerCase();
        id = `${dbKey}-${item.Host_Protein}-${item.Pathogen_Protein}`;
      } else if ('intdb_x' in item) {
        dbKey = item.intdb_x.toLowerCase();
        id = `${dbKey}-${item.Host_Protein}-${item.Pathogen_Protein}`;
      } else {
        dbKey = item.intdb.toLowerCase();
        id = `${dbKey}-${item.Host_Protein}-${item.Pathogen_Protein}`;
      }

      if ('intdb' in item) {
        domDict[item.intdb.toLowerCase()].push(`#${id}`);
      }

      if ('intdb_x' in item) {
        intDict[item.intdb_x.toLowerCase()].push(`#${id}`);
      }

      if (!methodDict[methodKey]) {
        methodDict[methodKey] = [];
      }

      return { data: { source: item.Host_Protein, target: item.Pathogen_Protein, id: id, Pathogen_Protein: item.Pathogen_Protein, Host_Protein: item.Host_Protein, Method: methodKey, domdb: item.intdb, intdb: item.intdb_x } };
    });

    uniqueHost_Proteins = Array.from(new Set(useData.map(item => { return item.Host_Protein })));
    uniquePatProteins = Array.from(new Set(useData.map(item => { return item.Pathogen_Protein })));

    // --- Find unique pathogen species present in the data ---
    const uniquePathogenSpecies = Array.from(new Set(useData.map(item => item.species).filter(sp => sp && sp !== 'taestivum')));
    // Update state (only if changed to avoid re-renders)
    if (JSON.stringify(uniquePathogenSpecies) !== JSON.stringify(pathogenSpeciesFound)) {
      setPathogenSpeciesFound(uniquePathogenSpecies);
    }

    // --- Create Node Elements with Species Data ---
    for (let hostP of uniqueHost_Proteins) {
      elements.push({ data: { id: hostP, label: hostP, species: proteinToSpecies[hostP] || 'taestivum' } });
    }
    for (let patP of uniquePatProteins) {
      elements.push({ data: { id: patP, label: patP, species: proteinToSpecies[patP] || 'unknown' } });
    }

    const opts = {
      nodeRepulsion: node => 450000,
      // Ideal edge (non nested) length
      idealEdgeLength: edge => 45,
      // Divisor to compute edge forces
      edgeElasticity: edge => 0.45,
      nodeSeparation: 50000,
      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 0.1,
      // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
      numIter: 2500,
      fit: true,
    }

    layout = { name: 'fcose', opts, avoidOverlap: true };
  }

  const interologColorMap = {
    "hpidb": '#ec8224',
    "mint": '#2b86ab',
    "intact": '#d6d978',
    "arabihpi": '#f07eba',
    "dip": '#7e7ef0',
    "biogrid": '#6ca6bc',
  };

  const domainColorMap = {
    "3did": '#ec8224',
    "iddi": '#2b86ab',
    "domine": '#d6d978',
  }

  const methodColorMap = {
    'experimental': '#FF5733',
    'prediction': '#33FF57',
    'mixed': '#5733FF',
    'Unknown': '#808080',
  };

  useEffect(() => {
    if (cyRef) {
      cyRef.edges().style({ 'line-color': '#ccc' });
      if (colorBy === 'intdb') {
        for (const db in intDict) {
          const color = interologColorMap[db];
          if (color && intDict[db].length > 0) {
            try {
              cyRef.$(intDict[db].join(', ')).style({ 'line-color': color });
            } catch (e) { console.error("Error applying style for intdb:", db, e); }
          }
        }
      } else if (colorBy === 'domdb') {
        for (const db in domDict) {
          const color = domainColorMap[db];
          if (color && domDict[db].length > 0) {
            try {
              cyRef.$(domDict[db].join(', ')).style({ 'line-color': color });
            } catch (e) { console.error("Error applying style for domdb:", db, e); }
          }
        }
      } 
    }
  // eslint-disable-next-line
  }, [colorBy, domDict, domainColorMap, intDict, interologColorMap, cyRef]);

  // --- Add useEffect for dynamic NODE styling ---
  useEffect(() => {
    if (cyRef) {
      cyRef.nodes().forEach(node => {
        const species = node.data('species');
        const color = speciesColorMap[species] || speciesColorMap.unknown;
        try {
          node.style({ 'background-color': color });
        } catch (e) { console.error("Error applying node style:", node.id(), species, e); }
      });
    }
  // eslint-disable-next-line
  }, [elements, cyRef]);

  return (
    <div>
      <div className="cy">
        <CyComp elements={elements} stylesheet={[
          {
            selector: 'node',
            style: {
              width: function (elements) { return Math.max(1, Math.ceil(elements.degree() / 10)) * 5; },
              height: function (elements) { return Math.max(1, Math.ceil(elements.degree() / 10)) * 5; },
            }
          },
          {
            selector: 'edge',
            style: {
              width: 1,
              'line-color': '#ccc'
            }
          }
        ]}
          cy={(cy) => {
            cyRef = cy;
            cyRef.on('click', 'node', function (e) {
              props.nodeHandler(e);
            });

            cyRef.on('click', 'edge', function (e) {
              props.edgeHandler(e.target.data());
            });

            // --- Edge coloring is handled by its own useEffect hook ---
          }}
          style={{ width: 'auto', height: '700px' }}
          layout={layout} className="cy-container" />

      </div>

      <Row className="mt-3 text-left">
        <Col sm={4}>
          <h5><u><b>Nodes</b></u></h5>
        </Col>
        <Col sm={4}>
          <h5><u><b>Edges</b></u></h5>

          {(params.category === 'interolog' || params.category === 'consensus') && (
            <Row className="legend-row">
              {params.category === 'consensus' && (
                <Form>
                  <Form.Check
                    inline
                    type="radio"
                    label="Database"
                    name="colorGroup"
                    id="colorByIntdb"
                    value="intdb"
                    checked={colorBy === 'intdb'}
                    onChange={(e) => setColorBy(e.target.value)}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Domain"
                    name="colorGroup"
                    id="colorByDomain"
                    value="domdb"
                    checked={colorBy === 'domdb'}
                    onChange={(e) => setColorBy(e.target.value)}
                  />
                </Form>
              )}
            </Row>
          )}
        </Col>

        <Col sm={4} className="text-right pr-4">
          <Button className="kbl-btn-1 px-3 mx-4" title="Download JSON" onClick={() => {
            const cyJson = cyRef.json();
            const str = JSON.stringify(cyJson);
            const bytes = new TextEncoder().encode(str);
            const blob = new Blob([bytes], {
              type: "application/json;charset=utf-8"
            });
            FileSaver.saveAs(blob, 'network.json');
          }}>
            <b>JSON</b>
          </Button>

          <IconContext.Provider value={{ className: "dl-icon" }}>
            <FaImage title="Download PNG" onClick={() => {
              // Wait for Cytoscape to be fully ready
              cyRef.ready(() => {
                const file = cyRef.png({ full: true, scale: 2, bg: 'white' });
                FileSaver.saveAs(file, 'network.png');
              });
            }} />
          </IconContext.Provider>
        </Col>
      </Row>

      <Row className="species">
        <Col sm={4}>
          {/* Static Host Legend Item */}
          <Row className="legend-row">
            <Col className="legend-item">
              <IconContext.Provider value={{ className: "legend-icon host", color: speciesColorMap.taestivum }}>
                <FaCircle />
              </IconContext.Provider>
              <span className="legend-text">Wheat protein</span>
            </Col>
          </Row>
          {/* Dynamic Pathogen Legend Items */}
          {pathogenSpeciesFound.map(speciesCode => (
            <Row className="mt-2 legend-row" key={speciesCode}>
              <Col className="legend-item">
                <IconContext.Provider value={{ className: "legend-icon pat", color: speciesColorMap[speciesCode] || speciesColorMap.unknown }}>
                  <FaCircle />
                </IconContext.Provider>
                {/* Use speciesNameMapping for the text */}
                <span className="legend-text">{speciesNameMapping[speciesCode] || speciesCode}</span>
              </Col>
            </Row>
          ))}
        </Col>

        <Col sm={4} >
          {colorBy === 'intdb' && Object.entries(interologColorMap).map(([key, color]) => (
            <Row className="legend-row mt-2" key={key}>
              <Col className="legend-item">
                <IconContext.Provider value={{ className: "legend-icon", color: color }}>
                  <FaCircle />
                </IconContext.Provider>
                <span className="legend-text">{key.toUpperCase()}</span>
              </Col>
            </Row>
          ))}
          {colorBy === 'domdb' && Object.entries(domainColorMap).map(([key, color]) => (
            <Row className="legend-row mt-2" key={key}>
              <Col className="legend-item">
                <IconContext.Provider value={{ className: "legend-icon", color: color }}>
                  <FaCircle />
                </IconContext.Provider>
                <span className="legend-text">{key.toUpperCase()}</span>
              </Col>
            </Row>
          ))}
          {colorBy === 'method' && Object.entries(methodColorMap).map(([key, color]) => (
            <Row className="legend-row mt-2" key={key}>
              <Col className="legend-item">
                <IconContext.Provider value={{ className: "legend-icon", color: color }}>
                  <FaCircle />
                </IconContext.Provider>
                <span className="legend-text">{key}</span>
              </Col>
            </Row>
          ))}
        </Col>
      </Row>

    </div>
  );
});
