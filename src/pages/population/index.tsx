import React, { useEffect, useState } from "react";
import "./style.css";
import { getAllPrefecture, getNumberOfPopulation } from "@/utils/api";
import Prefectures from "@/components/Population/Prefectures";
import PopulationChart from "@/components/Population/Chart";
import _ from "lodash";

export default function Population() {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // store population data get from api
    const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);

    // store list of prefecture (include name and code)
    const [prefectures, setPrefectures] = useState<Prefecture[]>([]);

    // store list of  selected prefecture (change when user toggle the prefecture)
    const [selectedPrefectures, setSelectedPrefecture] = useState<Prefecture[]>(
        []
    );

    // store list of prefecture that is currently showing on the chart
    const [showPrefectures, setShowPrefectures] = useState<Prefecture[]>([]);

    // store list of prefecture that is loaded and has been stored in chartData
    // => in order to prevent duplicate loading of data
    const [loadedPrefectures, setLoadedPrefectures] = useState<Prefecture[]>(
        []
    );

    /* flow: 
        * (useEffect) get all prefecture data from api => store in prefectures
        * whenever user toggle the prefecture [ON]:
            + add prefecture to selectedPrefectures
            + load data for the prefecture if it is not loaded yet (using function addData)
            + add data to chartData
            + add prefecture to showPrefectures
        * whenever user toggle the prefecture [OFF]:
            + remove prefecture from selectedPrefectures
            + remove prefecture from showPrefectures
            (data still in chartData)
    */

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const numberOfPref = 47;
                let prefs = JSON.parse(localStorage.getItem("prefectures") || "[]");
                if (prefs.length === numberOfPref) {
                    setPrefectures(prefs);
                } else {
                    prefs = await getAllPrefecture();
                    setPrefectures(prefs);
                    console.log('prefs:', prefs);
                    localStorage.setItem('prefectures', JSON.stringify(prefs));
                }

                const chartData = JSON.parse(localStorage.getItem("chartData") || "[]");
                if (chartData.length > 0) {
                    setChartData(chartData);
                    const loadedPrefs =  JSON.parse(localStorage.getItem("loadedPrefectures") || "[]");
                    if (loadedPrefs.length > 0) {   
                        setLoadedPrefectures(loadedPrefs);
                    }
                }    
                else {
                    // init data for chartData
                    const firstYearInData = 1960;
                    const lastYearInData = 2045;
                    const tmpData = [];
                    for (
                        let year = firstYearInData;
                        year <= lastYearInData;
                        year += 5
                    ) {
                        tmpData.push({ year });
                    }
                    setChartData(tmpData);
                }

            } catch (e) {
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const addData = async (pref: Prefecture) => {
        // check if data is already loaded
        if (loadedPrefectures.includes(pref)) {
            return;
        }
        let tmpData = chartData;
        let prefPopulation = await getNumberOfPopulation(pref.prefCode);
        prefPopulation = _.map(prefPopulation, (item: any) => ({
            year: item.year,
            [pref.prefName]: item.value,
        }));
        tmpData = _.merge(tmpData, prefPopulation);
        setChartData(tmpData);
        setLoadedPrefectures([...loadedPrefectures, pref]);
        localStorage.setItem("chartData", JSON.stringify(tmpData));
        localStorage.setItem("loadedPrefectures", JSON.stringify([...loadedPrefectures, pref]));
    };

    return (
        <div className="container">
            <h2 className="title">都道府県別の総人口推移グラフ</h2>
            {isLoading && <div>Loading...</div>}
            {isError && <div>Error</div>}
            {!isLoading && !isError && (
                <>
                    <div className="flex">
                        <div className="prefecture-list-wrapper">
                            {!isLoading && !isError && (
                                <Prefectures
                                    prefectures={prefectures}
                                    selectedPrefectures={selectedPrefectures}
                                    setShowPrefectures={setShowPrefectures}
                                    setSelectedPrefectures={
                                        setSelectedPrefecture
                                    }
                                    addData={addData}
                                />
                            )}
                        </div>
                        <div className="chart-wrapper">
                            <PopulationChart
                                showPrefectures={showPrefectures}
                                data={chartData}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
