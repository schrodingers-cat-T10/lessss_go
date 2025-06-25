import { useRef, useEffect } from "react";
import * as THREE from "three";

function Threedim() {
  const mountref = useRef(null);

  useEffect(() => {
    if (!mountref.current) return;

    const width = mountref.current.clientWidth || window.innerWidth;
    const height = mountref.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    mountref.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: "green" });
    material.opacity(0.5);
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountref.current && renderer.domElement) {
        mountref.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountref}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    ></div>
  );
}

export default Threedim;
