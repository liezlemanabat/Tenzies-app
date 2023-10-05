import React from "react"
import Die from "./Die"
import Footer from "./Footer"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {
    
    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [gameOver, setGameOver] = React.useState(false)
    const [rolls, setRolls] = React.useState(0)
    const [startTime, setStartTime] = React.useState(null)
    const [endTime, setEndTime] = React.useState(null)
    const [bestTime, setBestTime] = React.useState(localStorage.getItem("bestTime") || null)
    
    function generateNewDice() {
        return {
            value: Math.floor(Math.random() * 6) + 1,
            isHeld: false,
            id: nanoid(),
        }
    }
       
    function allNewDice() {
        const randomDice = []
        for (let i = 0; i < 10; i++) {
            // Generate a random number between 1 and 6 inclusive
            randomDice.push(generateNewDice())
        }
        return randomDice
    }   
    
   function rollDice() {
      setDice(oldDice => oldDice.map(die => {
          return die.isHeld ? die: generateNewDice()
      }))
      setRolls((prevRolls) => prevRolls + 1)
   } 
   
   function holdDice(id) {
        // Find the selected die based on its id
        const selectedDie = dice.find((die) => die.id === id)       

        // Check if there are other held dice with a different value
        const otherHeldDiceWithDiffValue = dice.some(
            (die) => die.isHeld && die.value !== selectedDie.value
        )
        // If the selected die is already held and there are other held dice with a different value
        if (selectedDie.isHeld && otherHeldDiceWithDiffValue) {
            // Update the state by mapping over the old dice array
            setDice((oldDice) =>         
            oldDice.map((die) =>
            // If the current die has the same id as the selected die, set isHeld to false
                die.id === id ? { id: die.id, value: die.value, isHeld: false } : die
            )
            )
        } else if (!selectedDie.isHeld) {
            // If the selected die is not held, toggle its isHeld property
            setDice((oldDice) =>
            oldDice.map((die) =>
            // If the current die has the same id as the selected die, toggle isHeld
                die.id === id ? { id: die.id, value: die.value, isHeld: !die.isHeld } : die
            )
            )
        }
    }

   function newGame() {
        setDice(allNewDice())
        setTenzies(false)
        setGameOver(false) // Reset the game when starting a new game
        setRolls(0)
        setStartTime(null)
        setEndTime(null)
        setBestTime(null)
        localStorage.removeItem("bestTime"); // Remove the best time from local storage when starting a new game
    }
    
    function formatTime(timeNow) {
        const minutes = Math.floor(timeNow / 60);
        const seconds = (timeNow % 60).toFixed(2);
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} seconds`;
    }


    React.useEffect(() => {
        if (tenzies && !endTime) {
            setEndTime(Date.now())
            const finalEndTime = Date.now()
            
            const timeTaken = (finalEndTime - startTime) / 1000
            if(bestTime === null || timeTaken < parseFloat(bestTime)) {
                setBestTime(timeTaken)
                localStorage.setItem("bestTime", timeTaken.toString())
            }
        }
        
        if (!startTime && !gameOver && !tenzies) {
            setStartTime(Date.now())
        }
    }, [tenzies, startTime, endTime, bestTime, gameOver])
    
    React.useEffect(() => { 
         // Check for a win condition when dice change
        const allHeld = dice.every((die) => die.isHeld)
        const allSameValue = dice.every(
        (die) => die.value === dice[0].value)
        
        if (allHeld && allSameValue) {
            setTenzies(true)
            setGameOver(true)
             // Calculate the time taken in seconds
        const endTimer = Date.now();
        const startTimer = startTime
        const timeInSeconds = (endTimer - startTimer) / 1000;

        // Compare the new time with the best time and update if necessary
        if (bestTime === null || timeInSeconds < parseFloat(bestTime)) {
            setBestTime(timeInSeconds);
            localStorage.setItem("bestTime", timeInSeconds.toString()); // Store as a string
            }
        }
   }, [dice])   
      
  
      const diceElements = dice.map(die => <Die 
                                        key={die.id} 
                                        value={die.value} 
                                        isHeld={die.isHeld} 
                                        holdDice={() => holdDice(die.id)}
                                        /> ) 
                                                                                   
    return (
        <div>
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <p className="status">
                {tenzies
                    ? `You won in ${rolls} rolls and ${((endTime - startTime) / 1000).toFixed(2)} seconds! Best time: ${
                        bestTime !== null ? formatTime(bestTime) : "N/A"
                    }`
                    : gameOver
                    ? "Game Over"
                    : ""}
                </p>
            <button onClick={gameOver ? newGame : rollDice}>
            {tenzies ? "New Game" : gameOver ? "Game Over" : "Roll"}
            </button>
        </main>
        <Footer />
       </div>
    )
}
