import React from "react";
import _ from "lodash";
import "./style.css";
import Switch from "@/components/common/Switch";
import Button from "@/components/common/Button";
interface PrefecturesProp {
    prefectures: Array<Prefecture>;
    selectedPrefectures: Array<Prefecture>;
    setSelectedPrefectures: (prefectures: Array<Prefecture>) => void;
    setShowPrefectures: (prefectures: Array<Prefecture>) => void;
    addData: (pref: Prefecture) => Promise<void>;
}

export default function PrefectureList(props: PrefecturesProp) {
    const handleToggle = async (pref: Prefecture) => {
        const newSelectedPrefecture = _.xor(props.selectedPrefectures, [pref]);
        props.setSelectedPrefectures(newSelectedPrefecture);
        await props.addData(pref);
        props.setShowPrefectures(newSelectedPrefecture);
    };
    const handleToggleOffAll = () => {
        props.setSelectedPrefectures([]);
        props.setShowPrefectures([]);
    };

    return (
        <>
            <ul className="prefecture-list__list">
                {props.prefectures.map((prefecture: Prefecture) => {
                    return (
                        <li
                            key={prefecture.prefCode}
                            className="prefecture-list__item"
                        >
                            <Switch
                                checked={_.includes(
                                    props.selectedPrefectures,
                                    prefecture
                                )}
                                onChange={() => handleToggle(prefecture)}
                            />
                            {prefecture.prefName}
                        </li>
                    );
                })}
            </ul>
            <Button
                className="prefecture-list__toggle-off-all-btn"
                onClick={handleToggleOffAll}
            >
                すべてスイッチオフ
            </Button>
        </>
    );
}
