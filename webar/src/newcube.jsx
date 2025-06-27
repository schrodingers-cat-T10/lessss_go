import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { XRHitTest, useXREvent } from "@react-three/xr";
import { Matrix4, Vector3 } from "three";
import Model from "./model";
import axios from "axios";

const matrix = new Matrix4();

export default function NewCube() {

  const [chat,updateChat] = useState("");
  const [inputtext,updateinput] = useState("");
  

  const speech = (text)=>{
        updateChat(text);
        const speechutterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speechutterance)
    }

  const speechrecognition = ()=>{
        const validrecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!validrecognition){
            alert("your browser is not capable of speech recognition");
        }

        const recognition = new validrecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
         
        recognition.start()
        
        recognition.onresult = (event)=>{
            const speechtext = event.results[0][0].transcript;
            updateinput(speechtext);
            console.log(speechtext);
            updatetext(speechtext); 
        }

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
        };
    }
      

    const updatetext = (inputtext) =>{
      console.log("Input Text",inputtext)
        axios.post("https://test20578.anganwaditest.co.in/chatbot",{textinput: {input: inputtext}}).then(res => {
          console.log("api success")
        speech(res.data.output)
        updateinput("");
        } ).catch(err => console.error(err))
    }

  const ringRef = useRef();
  const [cubePos, setCubePos] = useState(null);
  const hitPosRef = useRef(new Vector3());

  useFrame(() => {
    if (!cubePos && ringRef.current) {
      ringRef.current.visible = true; 
      ringRef.current.position.copy(hitPosRef.current);
    }
  });


  const handleHit = (hits, getWorldMatrix) => {
    if (!hits.length) return;
    getWorldMatrix(matrix, hits[0]);
    hitPosRef.current.setFromMatrixPosition(matrix);
  };


  useXREvent("select", () => {
    if (!cubePos && ringRef.current) {
      const finalPosition = ringRef.current.position.clone();
      setCubePos(finalPosition);
    }
    else if(cubePos) { 
        speechrecognition();
    }
  });

  return (
    <>
      <ambientLight intensity={1} />

      {!cubePos && (
        <XRHitTest
          space="viewer"
          onResults={handleHit}
        />
      )}

      {!cubePos && (
        <mesh ref={ringRef} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.1, 0.25, 32]} />
          <meshStandardMaterial color="lightgreen" />
        </mesh>
      )}

      {cubePos && (
          <Model  position={cubePos.toArray()}/>
      )}
    </>
  );
}
