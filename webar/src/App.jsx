import Experiment from "./experiment.jsx";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function App(){
  
  return (<>
<BrowserRouter>
  <nav>
    <Link to="/">
    hello
    </Link>
  </nav>
  <Routes>
    <Route path="/" element={<Experiment/>}></Route>
  </Routes>
</BrowserRouter>
  </>);
}

export default App;