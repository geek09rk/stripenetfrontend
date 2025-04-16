import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import { env } from '../../env';
import './TNavbar.scss';

class TNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: this.props.active
    };
  }

  activeLink(link) {
    return link === this.props.active ? 'nav-link active' : 'nav-link';
  }

  render() {
    return (
      <div className="navbar-wrapper">
        <div className="container navbar-container animated-background" style={{ borderRadius: '15px', overflow: 'visible' }}>
          <Navbar expand="lg" className="custom-navbar" style={{ borderRadius: '15px', zIndex: '9999' }}>
            <Navbar.Brand href={env.BASE_URL} className="brand-logo">
              <span className="logo-text">StripeNET</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ml-auto nav-links">
                <Nav.Link href={`${env.BASE_URL}/`} className={`${this.activeLink('/')} me-4`}>Home</Nav.Link>
                <Nav.Link href={`${env.BASE_URL}/interactome`} className={`${this.activeLink('interactome')} me-4`}>Interactome</Nav.Link>
                
                <Dropdown className="nav-item">
                  <Dropdown.Toggle 
                    as="a" 
                    className="nav-link custom-dropdown-toggle me-4" 
                    id="annotations-dropdown"
                  >
                    Protein Annotations
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="multi-level-dropdown">
                    <div className="dropdown-submenu">
                      <Dropdown.Item className="dropdown-toggle"><strong>Wheat</strong></Dropdown.Item>
                      <ul className="submenu">
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/tf/?id=wheat`}>Transcription Factors</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/local/?id=wheat`}>Subcellular Localization</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/interpro/?id=wheat`}>Functional Domains</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/go/?id=wheat`}>Gene Ontology</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/kegg/?id=wheat`}>KEGG Pathways</a></li>
                      </ul>
                    </div>

                    <div className="dropdown-submenu">
                      <Dropdown.Item className="dropdown-toggle"><strong><i>P. striiformis</i></strong></Dropdown.Item>
                      <ul className="submenu">
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/effectors/?id=pstr`}>Effectors</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/secretory/?id=pstr`}>Secretory Proteins</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/transmemb/?id=pstr`}>Transmembrane Proteins</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/local/?id=pstr`}>Subcellular Localization</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/interpro/?id=pstr`}>Functional Domains</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/go/?id=pstr`}>Gene Ontology</a></li>
                      </ul>
                    </div>

                    <div className="dropdown-submenu">
                      <Dropdown.Item className="dropdown-toggle"><strong><i>P. striiformis</i> (PST-78)</strong></Dropdown.Item>
                      <ul className="submenu">
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/effectors/?id=pstr78`}>Effectors</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/secretory/?id=pstr78`}>Secretory Proteins</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/transmemb/?id=pstr78`}>Transmembrane Proteins</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/local/?id=pstr78`}>Subcellular Localization</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/interpro/?id=pstr78`}>Functional Domains</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/go/?id=pstr78`}>Gene Ontology</a></li>
                      </ul>
                    </div>

                    <div className="dropdown-submenu">
                      <Dropdown.Item className="dropdown-toggle"><strong><i>P. striiformis</i> (PST-130)</strong></Dropdown.Item>
                      <ul className="submenu">
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/effectors/?id=pstr130`}>Effectors</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/secretory/?id=pstr130`}>Secretory Proteins</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/transmemb/?id=pstr130`}>Transmembrane Proteins</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/local/?id=pstr130`}>Subcellular Localization</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/interpro/?id=pstr130`}>Functional Domains</a></li>
                        <li><a target="_blank" rel="noreferrer" href={`${env.BASE_URL}/go/?id=pstr130`}>Gene Ontology</a></li>
                      </ul>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>

                <Nav.Link href={`${env.BASE_URL}/help`} className={`${this.activeLink('help')} me-4`}>User Guide</Nav.Link>
              </Nav>
            </Navbar.Collapse>

          </Navbar>
        </div>
      </div>
    );
  }
}

export { TNavbar };