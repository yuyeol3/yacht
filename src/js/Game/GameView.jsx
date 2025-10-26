import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameController } from "./GameController";
import { Player } from "./Player";
import "./GameView.css"
import "./GameUI.css";


function ScoreBoardView() {
    const initSB = gameController.getScoreBoard();
    const [scores, setScores] = useState([...(initSB?.scoreBoard ?? [])]);
    const [possibleScores, setPossibleScores] = useState(initSB?.turnScoreResult ? { ...initSB.turnScoreResult } : null);

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
            gameController.getScoreBoard()?.publisher.unsubscribe(updateScores);
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
        gameController.getPlayers().length === 0 ? 
        <div>Player Not found</div> : 
        <div className="score-board">
            <table>
                <thead>
                    <tr key={"table_header"}>
                        <th>Categories</th>
                        {gameController.getPlayers().map((p)=>(<th key={p.id}>{p.name}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {
                        Array.from(labels.keys()).map((label_val, label_idx)=>{
                            return (
                                <tr key={label_idx}>
                                    <td>{label_val}</td>
                                    {gameController.getPlayers().map((val, idx)=>{
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
    const [whoseTurn, setWhoseTurn] = useState(gameController.getPlayers()?.[0]?.name ?? "");
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

    return (<div className="game-status">
        <h3>{whoseTurn}'s Turn</h3>
        <h3>{round}/12</h3>
    </div>);
}

function DiceBoard({ onToggleScoreboard }) {

    const [rolledDice, setRolledDice] = useState([0, 0, 0, 0, 0]);
    const [selectedDice, setSelectedDice] = useState([0, 0, 0, 0, 0]);
    const [leftCount, setLeftCount] = useState(3);
    const [isRolling, setIsRolling] = useState(false);
    const [dropAnim, setDropAnim] = useState(false);
    const [dieVars, setDieVars] = useState([]); // per-die CSS vars for wander path



    useEffect(()=>{
        const updateStat = (data) =>{
            if (data.isRolling !== undefined) {
                setIsRolling(data.isRolling);
            }
            if (data.rolledDice) {
                setRolledDice([...data.rolledDice]);
            }
            if (data.selected) {
                setSelectedDice([...data.selected]);
            }
            if (data.leftCount !== undefined) {
                setLeftCount(data.leftCount);
            }
            if (data.dropAnimation) {
                setDropAnim(true);
                setTimeout(()=>setDropAnim(false), 650);
            }
        }

        gameController.getDiceBoard().publisher.subscribe(updateStat);

        return ()=>{
            gameController.getDiceBoard().publisher.unsubscribe(updateStat);
        }

    }, []);
    // generate random wander variables when rolling starts
    useEffect(() => {
        if (isRolling) {
            const count = rolledDice.filter((e)=>e!==0).length || (5 - selectedDice.filter(e=>e!==0).length);
            const vars = Array.from({ length: count }).map(() => ({
                dx: Math.floor((Math.random() * 120) - 60), // -60 ~ 60px
                dy: Math.floor((Math.random() * 80) - 40),  // -40 ~ 40px
                rot: Math.floor(360 + Math.random() * 1080), // 360~1440 deg
                dur: (0.6 + Math.random() * 0.8).toFixed(2) // 0.6s ~ 1.4s
            }));
            setDieVars(vars);
        } else {
            setDieVars([]);
        }
    }, [isRolling, rolledDice.length, selectedDice.join(",")]);

    return (
        // <div className="dice-board"> 로 감싸기
        <div className="dice-board">
            <div className="panel-head">
                <GameStatusBar/>
                <button className="icon-button" onClick={onToggleScoreboard} title="점수판 보기/숨기기">🏅</button>
            </div>
            <p>Left: {leftCount}</p>
            <div>
                <h3>Selected</h3>
                {/* <div className="dice-container"> 로 감싸기 */}
                <div className="dice-container">
                    {selectedDice.map((e, idx) => (
                        e === 0 ? null : <button disabled={isRolling} key={"selected" + idx} className="die" onClick={() => gameController.getDiceBoard().unkeepDice(idx)}>{e}</button>
                    ))}
                </div>
            </div>
            <div>
                <h3>Rolled</h3>
                <div className="dice-container">
                    {isRolling && <div className="dice-cup" />}
                    {rolledDice.map((e, idx) => (
                        e === 0 ? null : 
                        <button
                            disabled={isRolling}
                            className={`rolled-dice die ${isRolling ? 'is-rolling' : (dropAnim ? 'is-dropping' : '')}`}
                            key={"rolled" + idx}
                            onClick={() => gameController.getDiceBoard().keepDice(idx)}
                            style={{
                                "--dx": (dieVars[idx]?.dx ?? 30) + "px",
                                "--dy": (dieVars[idx]?.dy ?? -20) + "px",
                                "--rot": (dieVars[idx]?.rot ?? 540) + "deg",
                                "--dur": (dieVars[idx]?.dur ?? 0.8) + "s",
                            }}
                        >{e}</button>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="roll-button" onClick={() => gameController.startRoll()} disabled={leftCount === 0 || isRolling || selectedDice.every((e)=>e!==0)}>Start</button>
                <button className="roll-button" onClick={() => gameController.stopRoll()} disabled={!isRolling}>Stop</button>
            </div>
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
    const navigate = useNavigate();
    const [gameFinished, setGameFinished] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [showScoreBoard, setShowScoreBoard] = useState(true);

    const [showBestCategory, setShowBestCategory] = useState(false);
    const [bestCategoryName, setBestCategoryName] = useState("")

    useEffect(()=>{
        if (gameController.getPlayers().length === 0) {
            navigate("/");
            return;
        }
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
        gameController.getScoreBoard()?.publisher.subscribe(updateScoreData);
        return ()=>{
            gameController.getGame().publisher.unsubscribe(updateGameData);
            gameController.getScoreBoard()?.publisher.unsubscribe(updateScoreData);
        }
    }, [])

    
    return (
        <div className="game app-container">
            {gameFinished ? 
            (<>
                <div className="game-header">
                    <div className="game-title">Yacht 결과</div>
                    <div className="game-status"><h3>게임 종료</h3></div>
                    <button 
                        onClick={()=>{setShowScoreBoard(!showScoreBoard)}}
                        className="icon-button"
                        title="점수판 보기"
                    >🏅</button>
                </div>
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
                    <DiceBoard onToggleScoreboard={()=>{setShowScoreBoard(!showScoreBoard)}}/>
                </div>
                <h1 className={`best-category-label ${showBestCategory ? "show" : ""}`}>{bestCategoryName}</h1>
            </>)
            }

        </div>
    )
}


