import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import NewCube from "./newcube";
import Model from "./model";

const store = createXRStore();

function Experiment() {
  return (
    <>
      <button onClick={() => store.enterAR()}>Enter AR</button>
      <Canvas>
        <XR store={store}>
          <NewCube/>
        </XR>
      </Canvas>
    </>
  );
}

export default Experiment;
