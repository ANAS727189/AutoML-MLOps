'use client'

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, OrbitControls, Line, Circle } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

// Define types for steps
type Step = {
  name: string
  color: string
  shape: string
}

type FlowChartStepProps = {
  position: [number, number, number]
  rotationSpeed: number
  scaleSpeed: number
  color: string
  shape: string
  progress: number
}

type FlowConnectionProps = {
  start: [number, number, number]
  end: [number, number, number]
  progress: number
  color: string
}

type CircularTimelineProps = {
  progress: number
}

const mlSteps: Step[] = [
  { name: "Data Ingestion", color: "#4CAF50", shape: "cylinder" },
  { name: "Data Preprocessing", color: "#2196F3", shape: "box" },
  { name: "Feature Engineering", color: "#FFC107", shape: "cone" },
  { name: "Model Training", color: "#9C27B0", shape: "sphere" },
  { name: "Model Evaluation", color: "#FF5722", shape: "octahedron" },
  { name: "Model Deployment", color: "#E91E63", shape: "tetrahedron" }
]

const FlowChartStep: React.FC<FlowChartStepProps> = ({ position, rotationSpeed, scaleSpeed, color, shape, progress }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed
      const scale = Math.min(1, progress * 1.2)
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  const Geometry: React.FC = () => {
    switch (shape) {
      case 'box': return <boxGeometry args={[1, 1, 1]} />
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />
      case 'cylinder': return <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
      case 'cone': return <coneGeometry args={[0.5, 1, 32]} />
      case 'octahedron': return <octahedronGeometry args={[0.5, 0]} />
      case 'tetrahedron': return <tetrahedronGeometry args={[0.6, 0]} />
      default: return <boxGeometry args={[1, 1, 1]} />
    }
  }

  return (
    <mesh ref={meshRef} position={position}>
      <Geometry />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} metalness={0.8} />
    </mesh>
  )
}

const FlowConnection: React.FC<FlowConnectionProps> = ({ start, end, progress, color }) => {
  const curve = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      points.push(new THREE.Vector3(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * 0.5,
        start[2] + (end[2] - start[2]) * t
      ))
    }
    return new THREE.CatmullRomCurve3(points)
  }, [start, end])

  const linePoints = useMemo(() => curve.getPoints(50), [curve])

  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={3}
      dashed={true}
      dashScale={50}
      dashSize={0.5}
      dashOffset={-progress * 50}
    />
  )
}

const CircularTimeline: React.FC<CircularTimelineProps> = ({ progress }) => {
  const radius = 4
  const width = 0.2
  const segments = 64

  return (
    <group>
      <Circle args={[radius, segments]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#333333" side={THREE.DoubleSide} />
      </Circle>
      <Circle args={[radius - width, segments]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
      </Circle>
      <Circle args={[radius - width / 2, segments]} rotation={[-Math.PI / 2, 0, Math.PI * 2 * progress]}>
        <meshBasicMaterial color="#00ff00" side={THREE.DoubleSide} />
      </Circle>
    </group>
  )
}

const AnimatedMLWorkflow: React.FC = () => {
  const [progress, setProgress] = useState(0)

  useFrame(() => {
    setProgress((prev) => (prev + 0.001) % 1)
  })

  return (
    <>
      <CircularTimeline progress={progress} />
      {mlSteps.map((step, index) => {
        const angle = (index / mlSteps.length) * Math.PI * 2 - Math.PI / 2
        const radius = 3
        const position: [number, number, number] = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0]
        const nextIndex = (index + 1) % mlSteps.length
        const nextAngle = (nextIndex / mlSteps.length) * Math.PI * 2 - Math.PI / 2
        const nextPosition: [number, number, number] = [Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius, 0]

        return (
          <group key={step.name}>
            <FlowChartStep
              position={position}
              rotationSpeed={0.01}
              scaleSpeed={1}
              color={step.color}
              shape={step.shape}
              progress={Math.max(0, Math.min(1, progress * mlSteps.length - index))}
            />
            <Text
              position={[position[0] * 1.3, position[1] * 1.3, 0]}
              color={step.color}
              fontSize={0.2}
              maxWidth={2}
              textAlign="center"
            >
              {step.name}
            </Text>
            <FlowConnection
              start={position}
              end={nextPosition}
              progress={Math.max(0, Math.min(1, progress * mlSteps.length - index))}
              color={step.color}
            />
          </group>
        )
      })}
      <Text
        position={[0, 0, 0]}
        color="white"
        fontSize={0.3}
        maxWidth={2}
        textAlign="center"
      >
        ML Workflow Progress: {Math.floor(progress * 100)}%
      </Text>
    </>
  )
}

const Scene: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      <color attach="background" args={['#111']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />

      <AnimatedMLWorkflow />

      <OrbitControls enableZoom={false} />

      <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  )
}

const Component: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black">
      <Scene />
    </div>
  )
}

export default Component
