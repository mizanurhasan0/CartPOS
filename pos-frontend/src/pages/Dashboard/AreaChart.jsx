/**
 * AreaChart - returns area chart as statistical view, based on data it gets
 * @params {array} args.data - 
 */
import Tooltip from "@/components/Shared/Tooltip/Tooltip";
import useFetch from "@/utils/hooks/useFetch";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import { useParams } from "react-router";


const Graph = () => {
    const { user } = useSelector(state => state.authStore);
    const [chartType, setChartType] = useState("day");
    const [datas, setDatas] = useState([]);
    const { get } = useFetch();
    const { id } = useParams();
    const handleChangeView = (view) => {
        setChartType(view);
    };
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions()
    useEffect(() => {
        if (user.role === 'superadmin') {
            get(`/admin/chart/reports?store=${id ? id : user?.store ? user?.store?.id : ''}&type=${chartType}&timezone=${timeZone}`)
                .then(res => {
                    setDatas(res);
                })
                .catch((e) => console.log(e))
        }
        //there is a bug, as super admin dont have any store id , so there should have a unique api to get data for chart.
        else {
            get(`/admin/chart/reports?type=${chartType}&timezone=${timeZone}`)
                .then(res => {
                    setDatas(res);
                })
                .catch((e) => console.log(e))
        }
    }, [chartType, user])

    const damiData = {
        day: {
            categories: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
            series: [
                {
                    name: "Sales",
                    data: chartType === 'day' && datas?.data || [],
                },
            ],
            color: '#023535',
        },
        week: {
            categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            series: [
                {
                    name: "Sales",
                    data: chartType === 'week' && datas?.data || [],
                },
            ],
            color: '#023535',
        },
        month: {
            categories: datas?.data?.categories || [],
            series: [
                {
                    name: "Sales",
                    data: chartType === 'month' && datas?.data.dailyData || [],
                },
            ],
            color: '#015958',
        },
        year: {
            categories: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            series: [
                {
                    name: "Sales",
                    data: chartType === 'year' && datas?.data || [],
                },
            ],
            color: '#0FC2C0',
        },
        // yearly: {
        //     categories: chartType === 'yearly' && datas?.data?.categories || [],
        //     series: [
        //         {
        //             name: "Sales",
        //             data: chartType === 'yearly' && datas?.data?.yearData || [],
        //         },
        //     ],
        //     color: '#008F8C',

        // },
    };

    const chartData = damiData[chartType];
    return (
        <div className="bg-white border border-border rounded-xl p-3 w-full min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex gap-2 items-center">
                    <span className="text-primary2 font-semibold text-sm">
                        Sales Overview ({chartType})
                    </span>
                    <Tooltip information="Sales Overview" />
                </h2>
                {(user?.role === 'admin' || id) && (
                    <div className="flex items-center gap-1">
                        {["day", "week", "month", "year"].map((view) => (
                            <button
                                key={view}
                                type="button"
                                onClick={() => handleChangeView(view)}
                                className={`text-xs font-semibold rounded-full px-3 py-1 capitalize ${chartType === view ? 'bg-primary1 text-white' : 'bg-light text-primary1'}`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <ReactApexChart
                    options={{
                        chart: {
                            id: `Sales Overview ${chartType}`,
                            toolbar: {
                                show: false,
                            },
                        },
                        xaxis: {
                            categories: chartData?.categories,
                        },
                        colors: [chartData?.color],
                        dataLabels: { enabled: false },
                        grid: { padding: { left: 0, right: 8 } },
                        legend: {
                            show: false,
                        },
                        stroke: {
                            curve: 'straight',
                        },
                        fill: {
                            opacity: 0.4,
                        },
                        height: 240,
                    }}
                    series={chartData?.series || []}
                    type="area"
                    width="100%"
                    height={240}
                />
            </div>
        </div>
    );
};

export default Graph;