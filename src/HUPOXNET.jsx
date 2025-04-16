import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import { env } from './env';
import { TNavbar } from './components/TNavbar/TNavbar';
import Home from './pages/Home/Home';
import GO from './pages/Annotation/GO';
import KEGG from './pages/Annotation/KEGG';
import Interpro from './pages/Annotation/Interpro';
import Local from './pages/Annotation/Local';
import Effectors from './pages/Annotation/Effectors';
import Secretory from './pages/Annotation/Secretory';
import Transmemb from './pages/Annotation/Transmemb';
import TF from './pages/Annotation/TF';
import Interactome from './pages/Interactome/Interactome';
import Results from './pages/Result/Results';
// import ANNOT from 'pages/Result/annotation';
import VisPage from './pages/VisPage/VisPage';
// import Datasets from './pages/Datasets/Datasets';
import Help from './pages/Help/Help';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';


export class HUPOXNET extends Component{
    constructor(props){
        super(props);
        this.state = {
            baseUrlLen: env.BASE_URL.split('/').length
        }
    }


    render(){
        return(
            <Router>
                <Container fluid className='App px-4'>
                <TNavbar active={document.location.pathname.split('/')[this.state.baseUrlLen]}/>
                <Routes>
                    <Route path={`${env.BASE_URL}/`} element={<Home />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/help`}  element={<Help />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/interactome`} element={<Interactome />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/results`} element={<Results />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/network`}  element={<VisPage />}>
                    </Route>

                    {/* <Route path={`${env.BASE_URL}/datasets`}  element={<Datasets />}>
                    </Route> */}

                    <Route path={`${env.BASE_URL}/go/`}  element={<GO />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/kegg/`}  element={<KEGG />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/interpro/`}  element={<Interpro />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/local/`}  element={<Local />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/effectors/`}  element={<Effectors />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/secretory/`}  element={<Secretory />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/transmemb/`}  element={<Transmemb />}>
                    </Route>

                    <Route path={`${env.BASE_URL}/tf/`}  element={<TF />}>
                    </Route>

                    {/* <Route path={`${env.BASE_URL}/annotation/`}  element={<ANNOT />}>
                    </Route> */}

                </Routes>
                </Container>
                </Router>
        )
    }
}