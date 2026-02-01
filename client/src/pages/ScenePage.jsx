import React from 'react'
import Scene from '../components/Jurrasic'
import DialogueBox from '../components/UI/DialogueBox'

export default function ScenePage() {
  return (
    <div className="scene-page relative w-full h-screen overflow-hidden">
      <Scene />
      <div className="ui-overlay absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <DialogueBox />
      </div>
    </div>
  )
}
