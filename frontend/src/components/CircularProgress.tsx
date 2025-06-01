import React from 'react'
import '../styles/circularProgess.css'

interface CircularProgressProps {
  percentage: number
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage }: CircularProgressProps) => {
  return (
    <>
      <div className="circularProgress" style={{ "--percent": percentage } as React.CSSProperties}>
      </div>
    </>
  )
}

export default CircularProgress