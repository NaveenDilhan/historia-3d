import React from 'react'


export default function Lighting() {
return (
<>
<directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
</>
)
}