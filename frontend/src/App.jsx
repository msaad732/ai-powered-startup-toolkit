import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import AboutUs from "./Components/AboutUs";
import IdeaValidation from "./Components/IdeaValidation";
import Finance from "./Components/Finance";
import NameSlogan from "./Components/NameSlogan";
import PitchDeck from "./Components/PitchDeck";
import PrivateEquity from "./Components/VentureCapitalists";
import SocialMedia from "./Components/SocialMedia";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/aboutus" element={<AboutUs />}></Route>
        <Route path="/ideavalidation" element={<IdeaValidation />}></Route>
        <Route path="/finance" element={<Finance />}></Route>
        <Route path="/name-slogangenerator" element={<NameSlogan />}></Route>
        <Route path="/pitch-ppt" element={<PitchDeck />}></Route>
        <Route path="/venture-capitalists" element={<PrivateEquity />}></Route>
        <Route path="/socialmedia" element={<SocialMedia />}></Route>
      </Routes>
    </>
  );
};

export default App;
