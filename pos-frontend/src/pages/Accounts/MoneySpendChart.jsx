/**
 * AreaChart - returns area chart as statistical view, based on data it gets
 * @params {array} args.data - 
 */
import Tooltip from "@/components/Shared/Tooltip/Tooltip";
import useFetch from "@/utils/hooks/useFetch";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";


const MoneySpendChart = () => {
    const { store } = useSelector(state =>
    ({
        user: state.authStore,
        store: state.storeStore.store,
    })
    );
    const [chartType, setChartType] = useState("weekly");
    const [datas, setDatas] = useState([]);
    const { get } = useFetch();

    const handleChangeView = (view) => {
        setChartType(view);
    };

    useEffect(() => {
        get(`/history-chart/expense/${store.id}/${chartType}`)
            .then(res => {
                setDatas(res.data);
            })
            .catch((e) => console.log(e))
    }, [chartType])

    return (
        <div className="w-full min-w-0 rounded-xl border border-border bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex gap-2 items-center">
                    <span className="text-primary2 font-semibold text-sm">
                        Money Spent ({chartType.slice(0, -2)})
                    </span>
                    <Tooltip information="Money Spent" />
                </h2>
                <div className="flex items-center gap-1">
                    {["week", "month", "year"].map((view) => (
                        <button
                            key={view}
                            type="button"
                            onClick={() => handleChangeView(`${view}ly`)}
                            className={`text-xs font-semibold rounded-full px-3 py-1 capitalize ${chartType === `${view}ly` ? 'bg-primary1 text-white' : 'bg-light text-primary1'}`}
                        >
                            {view}
                        </button>
                    ))}
                </div>
            </div>
            <ReactApexChart
                options={{
                    chart: {
                        id: 'Total Money Spent',
                        toolbar: {
                            show: false,
                        },
                    },
                    xaxis: {
                        categories: datas?.categories,
                    },
                    yaxis: {
                        show: true,
                        axisBorder: true,
                        decimalsInFloat: Number,
                    },
                    stroke: {
                        curve: 'straight',
                        colors: ['#DB7D89'],
                        dashArray: 0,
                        width: 1

                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            type: 'vertical',
                            opacityFrom: 4,
                            opacityTo: 0,
                        }
                    },
                    colors: ['#DB7D89'],
                    dataLabels: { enabled: false },
                }}
                series={datas?.series || []}
                type='area'
                width='100%'
                height={240}
            />
        </div>
    );
};

export default MoneySpendChart;