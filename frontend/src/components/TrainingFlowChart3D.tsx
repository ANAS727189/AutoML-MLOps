// // TrainingFlowChart3D.tsx
// 'use client'

// import React, { useRef, useState, Suspense } from 'react'
// import { Canvas, useFrame, useThree } from '@react-three/fiber'
// import { Text, OrbitControls, Html } from '@react-three/drei'
// import * as THREE from 'three'

// interface TrainingStep {
//   name: string
//   description: string
//   completed: boolean
// }

// interface TrainingData {
//   modelName: string
//   dataProcessing: string
//   modelType: string
//   evaluationMetrics: {
//     accuracy?: number | undefined
//     mse?: number | undefined
//     r2?: number | undefined
//   }
// }

// const Node: React.FC<{
//   position: [number, number, number]
//   name: string
//   description: string
//   completed: boolean
//   onClick: () => void
// }> = ({ position, name, description, completed, onClick }) => {
//   const mesh = useRef<THREE.Mesh>(null)
//   const [hovered, setHovered] = useState(false)

//   useFrame(() => {
//     if (mesh.current) {
//       mesh.current.rotation.x += 0.01
//       mesh.current.rotation.y += 0.01
//     }
//   })

//   return (
//     <group position={position}>
//       <mesh
//         ref={mesh}
//         onClick={onClick}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//       >
//         <sphereGeometry args={[0.5, 32, 32]} />
//         <meshStandardMaterial color={completed ? "green" : "red"} />
//       </mesh>
//       <Html position={[0, 1, 0]} center>
//         <div className="bg-gray-800 p-2 rounded-lg text-white text-xs w-32">
//           <h3 className="font-bold">{name}</h3>
//           <p>{description}</p>
//         </div>
//       </Html>
//     </group>
//   )
// }

// const TrainingFlow: React.FC<{
//   steps: TrainingStep[]
//   trainingData: TrainingData
// }> = ({ steps, trainingData }) => {
//   const { camera } = useThree()
  
//   React.useEffect(() => {
//     camera.position.z = 10
//   }, [camera])

//   return (
//     <>
//       {steps.map((step, index) => (
//         <Node
//           key={index}
//           position={[index * 2 - 4, 0, 0]}
//           name={step.name}
//           description={step.description}
//           completed={step.completed}
//           onClick={() => console.log(`Clicked ${step.name}`)}
//         />
//       ))}
//       <Text
//         position={[0, 2, 0]}
//         color="white"
//         fontSize={0.5}
//         maxWidth={5}
//         textAlign="center"
//       >
//         {`Model: ${trainingData.modelName}\nType: ${trainingData.modelType}`}
//       </Text>
//       <Text
//         position={[0, -2, 0]}
//         color="white"
//         fontSize={0.4}
//         maxWidth={5}
//         textAlign="center"
//       >
//         {`Accuracy: ${trainingData.evaluationMetrics.accuracy?.toFixed(2) || 'N/A'}\nMSE: ${trainingData.evaluationMetrics.mse?.toFixed(2) || 'N/A'}\nR2: ${trainingData.evaluationMetrics.r2?.toFixed(2) || 'N/A'}`}
//       </Text>
//     </>
//   )
// }

// const Scene: React.FC<{
//   currentStep: number
//   trainingData: TrainingData
// }> = ({ currentStep, trainingData }) => {
//   const steps: TrainingStep[] = [
//     { name: 'Data Preprocessing', description: trainingData.dataProcessing, completed: currentStep > 0 },
//     { name: 'Feature Engineering', description: 'Selecting and transforming features', completed: currentStep > 1 },
//     { name: 'Model Selection', description: `Selected: ${trainingData.modelType}`, completed: currentStep > 2 },
//     { name: 'Training', description: 'Training the model with data', completed: currentStep > 3 },
//     { name: 'Evaluation', description: 'Assessing model performance', completed: currentStep > 4 },
//     { name: 'Finalization', description: 'Preparing model for deployment', completed: currentStep > 5 }
//   ]

//   return (
//     <>
//       <ambientLight intensity={0.5} />
//       <pointLight position={[10, 10, 10]} />
//       <TrainingFlow steps={steps} trainingData={trainingData} />
//       <OrbitControls enableZoom={true} enableRotate={true} />
//     </>
//   )
// }

// const TrainingFlowChart3D: React.FC<{
//   currentStep: number
//   trainingData: TrainingData
// }> = ({ currentStep, trainingData }) => {
//   const [mounted, setMounted] = useState(false)

//   React.useEffect(() => {
//     setMounted(true)
//   }, [])

//   if (!mounted) {
//     return null
//   }

//   return (
//     <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
//       <Canvas>
//         <Suspense fallback={null}>
//           <Scene currentStep={currentStep} trainingData={trainingData} />
//         </Suspense>
//       </Canvas>
//     </div>
//   )
// }

// export default TrainingFlowChart3D