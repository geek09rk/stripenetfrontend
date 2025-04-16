import React from "react";
import { Divider, Card, Typography } from "antd";
import './Help.scss';
import { LinkOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default class Help extends React.Component {
    render() {
        return (
                <div class="help-page">
                    <Title level={2} className="title">User Guide</Title>

                    <Card className="card" bordered={false}>
                        <Title level={4} className="card-title">Introduction</Title>
                        <Paragraph className="card-content">
                            This is the tutorial page of StripeNET and will guide you through the database and its applicability. In case of any questions, contact <a href="mailto:raghav.kataria@usu.edu">bioinfo@kaabil.net</a>.
                        </Paragraph>
                    </Card>

                    <Card className="card" bordered={false}>
                        <Title level={4} className="card-title">Proteome Datasets</Title>
                        <Paragraph className="card-content">
                            In this database, we implemented multiple strains of <i>P. striiformis</i> (PST) that were obtained 
                            from <a target="_blank" rel="noreferrer" href="https://fungi.ensembl.org/index.html">Ensembl Fungi <sup><i><LinkOutlined /></i></sup></a>, while that of <i>T. aestivum</i> was obtained from <a target="_blank" rel="noreferrer" href="https://plants.ensembl.org/index.html">Ensembl Plants <sup><i><LinkOutlined /></i></sup></a>. The users can download the required protein sequences from the publicly available resources.
                        </Paragraph>
                    </Card>

                    <Card className="card" bordered={false}>
                        <Title level={4} className="card-title">Homepage</Title>
                        <Paragraph className="card-content">
                            Below is the <b>Homepage</b> of StripeNET, from where the users can navigate to the various functional annotations of the database and access the interactome prediction tool.
                        </Paragraph>
                        {/* <img src="images/home.png" className="imk" alt="" /> */}
                    </Card>

                    <Card className="card" bordered={false}>
                        <Title level={4} className="card-title">Interactome Prediction</Title>
                        <Paragraph className="card-content">
                            The <a target="_blank" href="interactome">Interactomics <sup><i><LinkOutlined /></i></sup></a> tool allows the user to find the interactions between <i>T. aestivum</i> and any strain of <i>P. striiformis</i> proteins. In this module, the user has the option to select the computational model of choice, standard interaction database(s) that will be used in the prediction process, and define BLASTp alignment filters to determine homolog proteins.
                        </Paragraph>
                        <Paragraph className="card-content">
                            The default values have been set for alignment filtering options (<i>e</i>-value, % sequence identity, and % sequence coverage) for both host and pathogen proteins. The users can also change these parameters to the values of their choice.
                        </Paragraph>
                        <Paragraph className="card-content">
                            This tool also enables the users to provide protein accessions of wheat or PST proteins, instead of using "Whole Proteome", for interaction prediction.
                        </Paragraph>
                        {/* <img src="images/interactome.png" className="imk" alt="" /> */}
                    </Card>

                    <Card className="card" bordered={false}>
                        <Title level={4} className="card-title">Interactome Output</Title>
                        <Paragraph className="card-content">
                            The user-provided information such as alignment filtering parameters of host and pathogen, number of interactions, host proteins, and pathogen proteins is displayed. The resulting table can be downloaded in csv format using the <b>Download CSV</b> button. Most of the information in this table is externally linked to various resources such as UniProt, Ensembl, PubMed, etc. to provide the user with additional information of the specific protein involved in the interaction. The gene expression of host proteins can also be accessed. Furthermore, the network of the predicted interactome can be visualized using the <b>Visualize Network</b> button.
                        </Paragraph>
                        {/* <img src="images/result.png" className="imk" alt="" /> */}
                    </Card>

                    <Card className="card" bordered={false}>
                        <Title level={4} className="card-title">Network Visualization</Title>
                        <Paragraph className="card-content">
                            StripeNET provides an efficient network visualization platform. This page includes the network of predicted interactions in tabular format. Clicking on a specific protein node in the network displays different features for the node (species, degree, etc.), and identify hub proteins (nodes with a higher number of edges). The resulted network can be further examined in any visualization tool that takes JSON or tabular network files as input.
                        </Paragraph>
                        <Paragraph className="card-content">
                            In the network, the color of the edges corresponds to the respective standard database(s) selected for interactome prediction. The green nodes represent host proteins, while the red nodes are pathogen proteins. Furthermore, the user can also obtain information about the "edge" by selecting a particular edge in the network. To analyze the network within the database, the user can select a particular node and move it around. The network can also be saved in PNG format.
                        </Paragraph>
                        {/* <img src="images/network.png" className="imk" alt="" /> */}
                    </Card>

                    <Divider />
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
                </div>
        )
    }
}
