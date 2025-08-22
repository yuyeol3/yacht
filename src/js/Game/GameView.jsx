import { useEffect, useState } from "react";
import { gameController } from "./GameController";
import { Player } from "./Player";
import "./GameView.css"


function ScoreBoardView() {
    const [scores, setScores] = useState([...gameController.getScoreBoard().scoreBoard]);
    const [possibleScores, setPossibleScores] = useState({...gameController.getScoreBoard().turnScoreResult});

    useEffect(()=>{
        const updateScores = (data) => {
            console.log(data);
            if (data.scoreBoard !== undefined)
                setScores([...data.scoreBoard]);
            if (data.possibleScores !== undefined)
                setPossibleScores(
                    data.possibleScores === null ?
                    null : {...data.possibleScores}
                );
        }

        gameController.getScoreBoard()?.publisher.subscribe(updateScores);
        return ()=>{
            gameController.getScoreBoard().publisher.unsubscribe(updateScores);
        }
    }, [])



    const labels = new Map([
        ["Ones", "ones"],
        ["Twos", "twos"],
        ["Threes", "threes"],
        ["Fours", "fours"],
        ["Fives", "fives"],
        ["Sixes", "sixes"],
        ["Subtotal", "bonusCrit"],
        ["Bonus", "bonus"],
        ["Choice", "choice"],
        ["4 of a Kind", "four_of_a_kind"],
        ["Full House", "full_house"],
        ["S. Straight", "s_straight"],
        ["L. Straight", "l_straight"],
        ["Yacht", "yacht"],
        ["Total", "total"]

    ])
    return (
        gameController.getPlayes().length === 0 ? 
        <div>Player Not found</div> : 
        <div className="score-board">
            <table>
                <thead>
                    <tr key={"table_header"}>
                        <th>Categories</th>
                        {gameController.getPlayes().map((p)=>(<th key={p.id}>{p.name}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {
                        Array.from(labels.keys()).map((label_val, label_idx)=>{
                            return (
                                <tr key={label_idx}>
                                    <td>{label_val}</td>
                                    {gameController.getPlayes().map((val, idx)=>{
                                            const propKey = label_val + idx.toString();
                                            if (
                                                !(["Subtotal", "Bonus", "Total"].includes(label_val)) && 
                                                idx === gameController.getGame().getTurn() && 
                                                possibleScores !== null &&
                                                (scores === null || scores[idx].getScore(labels.get(label_val)) === null)
                                            ) {
                                                const possibleScore = possibleScores[labels.get(label_val)];
                                                console.log("possibleScore", possibleScore, possibleScores);
                                                return (
                                                    <td className="possible-score" 
                                                        key={propKey} 
                                                        onClick={()=>{gameController.confirmScore(labels.get(label_val))}}
                                                    >
                                                        {possibleScore === null ? "0" : possibleScore}
                                                    </td>
                                                )                                            
                                            }
                                                    
                                            return (
                                                scores === null || scores[idx].getScore(labels.get(label_val)) === null ? 
                                                <td key={propKey}>-</td> : 
                                                <td key={propKey}>
                                                    {   label_val == "Subtotal" ? 
                                                        scores[idx][labels.get(label_val)] + "/63" :
                                                        scores[idx][labels.get(label_val)]
                                                    }
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

function GameStatusBar() {
    const [whoseTurn, setWhoseTurn] = useState(gameController.players[0].name);
    const [round, setRound] = useState(1);

    useEffect(()=>{
        const updateData = (data)=>{
            if (data.whoseTurn !== undefined) 
                setWhoseTurn(data.whoseTurn);
            if (data.round !== undefined)
                setRound(data.round);
        }

        gameController.getGame().publisher.subscribe(updateData);

        return ()=>{
            gameController.getGame().publisher.unsubscribe(updateData);
        }
    }, [])

    return (<div id="game-status-bar">
        <h3>{whoseTurn}'s Turn</h3>
        <h3>{round}/12</h3>
    </div>);
}

function DiceBoard() {

    const [rolledDice, setRolledDice] = useState([0, 0, 0, 0, 0]);
    const [selectedDice, setSelectedDice] = useState([0, 0, 0, 0, 0]);
    const [leftCount, setLeftCount] = useState(3);
    const [isRolling, setIsRolling] = useState(false);



    useEffect(()=>{
        const updateStat = (data) =>{
            console.log("DiceBoard", data);
            if (data.rolledDice) {
                if (!data.runAnimation)
                    setRolledDice([...data.rolledDice]);
                else {
                    setIsRolling(true);
                    setRolledDice([...data.rolledDice]);
                    setTimeout(()=>{
                        setIsRolling(false);
                    }, 500);
                }
                
            }
                
            if (data.selected) {
                setSelectedDice([...data.selected]);
            }
            if (data.leftCount !== undefined) {
                setLeftCount(data.leftCount);
            }
        }

        gameController.getDiceBoard().publisher.subscribe(updateStat);

        return ()=>{
            gameController.getDiceBoard().publisher.unsubscribe(updateStat);
        }

    }, []);
    return (
        // <div className="dice-board"> 로 감싸기
        <div className="dice-board">
            <p>Left: {leftCount}</p>
            <div>
                <h3>Selected</h3>
                {/* <div className="dice-container"> 로 감싸기 */}
                <div className="dice-container">
                    {selectedDice.map((e, idx) => (
                        e === 0 ? null : <button key={"selected" + idx} onClick={() => gameController.getDiceBoard().unkeepDice(idx)}>{e}</button>
                    ))}
                </div>
            </div>
            <div>
                <h3>Rolled</h3>
                <div className="dice-container">
                    {rolledDice.map((e, idx) => (
                        e === 0 ? null : 
                        <button 
                            className={`rolled-dice ${isRolling ? 'is-rolling' : ''}`} 
                            key={"rolled" + idx} onClick={() => gameController.getDiceBoard().keepDice(idx)}
                        >{e}</button>
                    ))}
                </div>
            </div>
            {/* <button className="roll-button"> 으로 클래스 추가 */}
            <button className="roll-button" onClick={() => gameController.roll()}>Roll</button>
        </div>
    );

}

function RankList({rank, playerName, playerScore}) {
    return (
        <div className="rank-list">
            <div>{rank}</div>
            <div>{playerName}</div>
            <div>{playerScore}점</div>            
        </div>
    )
}

export default function GameView() {
    const [gameFinished, setGameFinished] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [showScoreBoard, setShowScoreBoard] = useState(true);

    const [showBestCategory, setShowBestCategory] = useState(false);
    const [bestCategoryName, setBestCategoryName] = useState("")

    useEffect(()=>{
        const updateGameData = (data)=>{
            if (data.gameFinished !== undefined)
                setGameFinished(data.gameFinished);
            if (data.ranking !== undefined) 
                setRanking([...data.ranking]);
        }

        const updateScoreData = (data) => {
            if (data.bestCategoryName !== undefined) {
                setBestCategoryName(data.bestCategoryName);
                setShowBestCategory(true);

                setTimeout(()=>setShowBestCategory(false), 1000);
            }
        }

        gameController.getGame().publisher.subscribe(updateGameData);
        gameController.getScoreBoard().publisher.subscribe(updateScoreData);
        return ()=>{
            gameController.getGame().publisher.unsubscribe(updateGameData);
            gameController.getScoreBoard().publisher.unsubscribe(updateScoreData);
        }
    }, [])

    
    return (
        <div className="game">
            {gameFinished ? 
            (<>
                <div className="game-content">
                    <ScoreBoardView/>
                    <div className="game-result-ranking">
                        <h3>ranking</h3>
                        {ranking.map((val, idx)=>{
                             return <RankList key={val.name} rank={idx+1} playerName={val.name} playerScore={val.score}/>
                        })}
                    </div>
                </div>
                
            </>)
            :
            (<>
                <div className="game-content">
                    {showScoreBoard ? <ScoreBoardView/> : <></>}
                    <DiceBoard/>
                </div>
                <GameStatusBar/>
                <button 
                    onClick={()=>{setShowScoreBoard(!showScoreBoard)}}
                    className="btn-show-scoreboard basic-button"
                >🏅</button>    
                <h1 className={`best-category-label ${showBestCategory ? "show" : ""}`}>{bestCategoryName}</h1>
            </>)
            }

        </div>
    )
}


