import React from "react";
import { Divider } from "antd";
import "../../scss/components/buttons.scss";
import "./Home.scss";
import CookieConsent from "react-cookie-consent";
import stripehome from './homepage.png';


export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  openModel = () => this.setState({ isOpen: true });
  closeModel = () => this.setState({ isOpen: false });

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center g-4 my-4">
          <div className="col-md-7 infodiv">
            <div className="text-center mb-4">
              <h4 className="py-3">
                <b>Wheat-Stripe Rust Interactome Database</b>
              </h4>
            </div>
            <Divider />

            <p className="about-text">
              <strong>Stripe rust</strong>, caused by the obligate biotrophic fungus <i>Puccinia striiformis f. sp. tritici</i> (Pst), 
              is a major disease of wheat worldwide. It significantly threatens global food security by reducing both yield and grain 
              quality. The disease manifests as yellow, stripe-like pustules 
              on leaves, which disrupt photosynthesis and severely weaken the plant.
              Infection begins when urediniospores of the fungus land on the surface of susceptible wheat leaves. Under cool and moist 
              conditions, the spores germinate and penetrate the host tissue through stomata. Once inside, the pathogen establishes a 
              sophisticated feeding structure called a haustorium within host cells, allowing it to extract nutrients while suppressing 
              plant defense responses. <i>Puccinia striiformis</i> exhibits high genetic variability, with numerous physiological races emerging 
              in different geographic regions. Among these, three notable strains have been extensively studied due to their aggressive 
              virulence profiles and widespread impact:
              <ul>
                <li>
                  <strong>PSTT</strong>: A general designation for pathotypes within the <i>Puccinia striiformis tritici</i> lineage. These 
                  strains serve as important references for understanding baseline virulence mechanisms and host adaptation strategies.
                </li>
                <li>
                  <strong>PST-78</strong>: A historically significant race that led to major wheat yield losses and was instrumental in 
                  revealing the pathogen's ability to rapidly evolve virulence against commonly deployed resistance genes.
                  </li>
                <li>
                  <strong>PST-130</strong>: A more recent and highly virulent race known for its ability to overcome multiple resistance 
                  genes in wheat. It has been involved in several outbreaks, emphasizing the need for continuous monitoring and 
                  resistance breeding.
                  </li>
              </ul>
              Understanding the molecular interactions between these pathogen strains and wheat host proteins is critical for developing 
              durable disease resistance. We developed <strong>StripeNET</strong> to address this need by compiling and visualizing 
              protein-protein interaction networks between wheat and various Pst strains, helping researchers dissect host-pathogen 
              dynamics at the systems level.
            </p>

          </div>
          <div className="col-md-5 d-flex align-items-center justify-content-center" style={{ paddingLeft: "50px" }}>
            <img src={stripehome} alt="Wheat-Stripe Rust Interactions" className="img-fluid rounded shadow" width={400}/>
          </div>
        </div>

        <hr></hr>

        <div className="row justify-content-center g-2 my-2">
          <div className="d-flex align-items-center justify-content-between" style={{ maxWidth: '700px', width: '100%' }}>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>&copy; 2025</span>
            <a href="https://kaabil.net" target="_blank" rel="noopener noreferrer">
              <img 
                src={`${process.env.PUBLIC_URL}/images/kaabil.png`}
                alt="Kaundal Artificial Intelligence and Advanced Bioinformatics Lab" 
                style={{ height: '50px', width: 'auto' }}
              />
            </a>
            <a href="https://usu.edu" target="_blank" rel="noopener noreferrer">
              <img 
                src={`${process.env.PUBLIC_URL}/images/usu_blue.png`}
                alt="Utah State University"
                style={{ height: '40px', width: 'auto' }}
              />
            </a>
          </div>
        </div>

        <CookieConsent
          location="bottom"
          buttonText="Accept!!"
          cookieName="myAwesomeCookieName2"
          style={{ background: "#2B373B" }}
          buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
          expires={150}
        >
          This website uses cookies to enhance the user experience.
        </CookieConsent>
      </div>
    );
  }
}
