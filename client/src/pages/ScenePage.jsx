import React from 'react'
import Scene from '../components/Scene'
import DialogueBox from '../components/UI/DialogueBox'

export default function ScenePage() {
  return (
    <div className="scene-page relative w-full h-screen overflow-hidden">
      <Scene />
      <div className="ui-overlay absolute bottom-0 left-0 w-full">
        <DialogueBox />
      </div>
    </div>
  )
}
