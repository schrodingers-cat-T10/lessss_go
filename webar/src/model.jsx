import { useGLTF } from '@react-three/drei';
import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function Model(props) {
  const { scene } = useGLTF('https://modelviewer.dev/shared-assets/models/Astronaut.glb');
  const modelRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.lookAt(camera.position);
    }
  }, [camera]);

  return (
    <primitive ref={modelRef} object={scene} {...props} scale={1} />
  );
}
