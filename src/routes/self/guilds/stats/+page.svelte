<script lang="ts">
    import { onMount } from "svelte";
    import {
        Chart,
        ArcElement,
        BarElement,
        Tooltip,
        Legend,
        Title,
        PieController,
        BarController,
        CategoryScale,
        LinearScale,
    } from "chart.js";
    import {
        convertSnowflakeToDate,
        fetchWithCache,
        getAccessToken,
        formatText,
    } from "$lib";
    import { Button, LoadingIndicator, snackbar } from "m3-svelte";
    import type { Guild } from "../../types";

    // Register Chart.js components
    Chart.register(
        ArcElement,
        BarElement,
        Tooltip,
        Legend,
        Title,
        PieController,
        BarController,
        CategoryScale,
        LinearScale,
    );

    let guilds: Guild[] = [];
    let loading = true;
    let transformedData: {
        rankDistribution: {
            Owner: number;
            Admin: number;
            Moderator: number;
            None: number;
        };
        nameStartDistribution: {
            "A-F": number;
            "G-L": number;
            "M-R": number;
            "S-Z": number;
            Other: number;
        };
        creationYears: { [year: string]: number };
        guildCount: number;
        generatedAt: number;
        featureCounts: { [feature: string]: number };
    } = {
        rankDistribution: {
            Owner: 0,
            Admin: 0,
            Moderator: 0,
            None: 0,
        },
        nameStartDistribution: {
            "A-F": 0,
            "G-L": 0,
            "M-R": 0,
            "S-Z": 0,
            Other: 0,
        },
        creationYears: {
            0: 0,
        },
        guildCount: 0,
        generatedAt: 0,
        featureCounts: {},
    };

    let isSmallScreen = false;

    let rankPieChart: HTMLCanvasElement | null = null;
    let nameStartPieChart: HTMLCanvasElement | null = null;
    let creationBarChart: HTMLCanvasElement | null = null;
    let featureCountBarChart: HTMLCanvasElement | null = null;

    function validateFormattedData(data: any) {
        if (
            typeof data !== "object" ||
            !data.rankDistribution ||
            !data.nameStartDistribution ||
            !data.creationYears
        ) {
            return false;
        }

        const rankDist = data.rankDistribution;
        const nameStartDist = data.nameStartDistribution;
        const creationYears = data.creationYears;

        const rankKeys = ["Owner", "Admin", "Moderator", "None"];
        for (const key of rankKeys) {
            if (typeof rankDist[key] !== "number") {
                return false;
            }
        }

        const nameStartKeys = ["A-F", "G-L", "M-R", "S-Z", "Other"];
        for (const key of nameStartKeys) {
            if (typeof nameStartDist[key] !== "number") {
                return false;
            }
        }

        for (const year in creationYears) {
            if (typeof creationYears[year] !== "number") {
                return false;
            }
        }

        if (typeof data.guildCount !== "number") {
            return false;
        }

        if (typeof data.featureCounts !== "object") {
            return false;
        }

        return true;
    }

    onMount(async () => {
        isSmallScreen = window.innerWidth < 800;

        if (window.location.hash.length > 1) {
            try {
                const decoded = atob(window.location.hash.substring(1));
                const parsed = JSON.parse(decoded);

                if (validateFormattedData(parsed)) {
                    transformedData = parsed;
                    loading = false;
                    setTimeout(generateCharts, 500);
                    return;
                }
            } catch (e) {
                console.warn("Failed to parse shared data from URL hash.", e);
                console.warn("Continuing to fetch data normally...");
            }
        }

        const auth = getAccessToken();
        const response = await fetchWithCache(
            `https://discord.com/api/v10/users/@me/guilds`,
            {
                headers: {
                    Authorization: `${auth.token_type} ${auth.token}`,
                },
            },
        );

        if (response.ok) {
            guilds = await response.json();
            loading = false;
            console.table(guilds);

            const creationYears: { [year: string]: number } = {};

            for (let i = 0; i < guilds.length; i++) {
                const guild = guilds[i];
                const creationDate = convertSnowflakeToDate(guild.id);
                const year = creationDate.getFullYear().toString();
                creationYears[year] = (creationYears[year] || 0) + 1;
            }

            transformedData.creationYears = creationYears;

            transformedData.rankDistribution = {
                Owner: guilds.filter((g) => g.owner).length,
                Admin: guilds.filter(
                    (g) =>
                        (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8) &&
                        !g.owner,
                ).length,
                Moderator: guilds.filter(
                    (g) =>
                        (BigInt(g.permissions) & BigInt(0x20)) ===
                            BigInt(0x20) &&
                        !g.owner &&
                        !(BigInt(g.permissions) & BigInt(0x8)),
                ).length,
                None: guilds.filter(
                    (g) =>
                        !g.owner &&
                        !(BigInt(g.permissions) & BigInt(0x8)) &&
                        !(BigInt(g.permissions) & BigInt(0x20)),
                ).length,
            };

            const nameStartCounts = {
                "A-F": 0,
                "G-L": 0,
                "M-R": 0,
                "S-Z": 0,
                Other: 0,
            };
            for (let i = 0; i < guilds.length; i++) {
                const firstChar = guilds[i].name.charAt(0).toUpperCase();
                if (firstChar >= "A" && firstChar <= "F") {
                    nameStartCounts["A-F"]++;
                } else if (firstChar >= "G" && firstChar <= "L") {
                    nameStartCounts["G-L"]++;
                } else if (firstChar >= "M" && firstChar <= "R") {
                    nameStartCounts["M-R"]++;
                } else if (firstChar >= "S" && firstChar <= "Z") {
                    nameStartCounts["S-Z"]++;
                } else {
                    nameStartCounts["Other"]++;
                }
            }

            transformedData.nameStartDistribution = nameStartCounts;

            const featureCounter = new Map<string, number>();
            for (let i = 0; i < guilds.length; i++) {
                const guild = guilds[i];
                // Example feature counting (you can expand this as needed)
                if (guild.features) {
                    for (let j = 0; j < guild.features.length; j++) {
                        const feature = guild.features[j];
                        featureCounter.set(
                            feature,
                            (featureCounter.get(feature) || 0) + 1,
                        );
                    }
                }
            }

            transformedData.featureCounts = {
                ...Object.fromEntries(featureCounter),
            };

            transformedData.guildCount = guilds.length;
            transformedData.generatedAt = Date.now();

            setTimeout(generateCharts, 500);
        } else {
            console.error("Failed to fetch guilds:", response.statusText);
        }
    });

    function generateCharts() {
        // Get the computed color value for on-surface
        const onSurfaceColor = `rgb(${getComputedStyle(document.documentElement).getPropertyValue("--m3-scheme-on-surface").trim()})`;

        new Chart(rankPieChart!, {
            type: "pie",
            data: {
                labels: [
                    `Owner (${((transformedData.rankDistribution.Owner / transformedData.guildCount) * 100).toFixed(1)}%)`,
                    `Admin (${((transformedData.rankDistribution.Admin / transformedData.guildCount) * 100).toFixed(1)}%)`,
                    `Moderator (${((transformedData.rankDistribution.Moderator / transformedData.guildCount) * 100).toFixed(1)}%)`,
                    `None (${((transformedData.rankDistribution.None / transformedData.guildCount) * 100).toFixed(1)}%)`,
                ],
                datasets: [
                    {
                        label: "Guild Count",
                        data: [
                            transformedData.rankDistribution.Owner,
                            transformedData.rankDistribution.Admin,
                            transformedData.rankDistribution.Moderator,
                            transformedData.rankDistribution.None,
                        ],
                        backgroundColor: [
                            "rgba(255, 206, 86, 0.2)",
                            "rgba(255, 99, 132, 0.2)",
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(75, 192, 192, 0.2)",
                        ],
                        borderColor: [
                            "rgba(255, 206, 86, 1)",
                            "rgba(255, 99, 132, 1)",
                            "rgba(54, 162, 235, 1)",
                            "rgba(75, 192, 192, 1)",
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: onSurfaceColor,
                        },
                    },
                    title: {
                        display: true,
                        text: "Your rank in servers",
                        color: onSurfaceColor,
                    },
                },
            },
        });

        new Chart(nameStartPieChart!, {
            type: "pie",
            data: {
                labels: Object.keys(transformedData.nameStartDistribution).map(
                    (key) =>
                        `${key} (${(
                            (transformedData.nameStartDistribution[
                                key as keyof typeof transformedData.nameStartDistribution
                            ] /
                                transformedData.guildCount) *
                            100
                        ).toFixed(1)}%)`,
                ),
                datasets: [
                    {
                        label: "Server Count",
                        data: Object.values(
                            transformedData.nameStartDistribution,
                        ),
                        backgroundColor: [
                            "rgba(255, 99, 132, 0.2)",
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(255, 206, 86, 0.2)",
                            "rgba(75, 192, 192, 0.2)",
                            "rgba(153, 102, 255, 0.2)",
                        ],
                        borderColor: [
                            "rgba(255, 99, 132, 1)",
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 206, 86, 1)",
                            "rgba(75, 192, 192, 1)",
                            "rgba(153, 102, 255, 1)",
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: onSurfaceColor,
                        },
                    },
                    title: {
                        display: true,
                        text: "Server name starting letter distribution",
                        color: onSurfaceColor,
                    },
                },
            },
        });

        new Chart(creationBarChart!, {
            type: "bar",
            data: {
                labels: Object.keys(transformedData.creationYears),
                datasets: [
                    {
                        label: "Guilds Created",
                        data: Object.values(transformedData.creationYears),
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: onSurfaceColor,
                        },
                    },
                    title: {
                        display: true,
                        text: "Guild Creation Years",
                        color: onSurfaceColor,
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: onSurfaceColor,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: onSurfaceColor,
                        },
                    },
                },
                indexAxis: isSmallScreen ? "y" : "x",
            },
        });

        new Chart(featureCountBarChart!, {
            type: "bar",
            data: {
                labels: Object.keys(transformedData.featureCounts).map((name) =>
                    formatText(name, true),
                ),
                datasets: [
                    {
                        label: "Guilds with Feature",
                        data: Object.values(transformedData.featureCounts),
                        backgroundColor: "rgba(153, 102, 255, 0.2)",
                        borderColor: "rgba(153, 102, 255, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: onSurfaceColor,
                        },
                    },
                    title: {
                        display: true,
                        text: "Guild Feature Counts",
                        color: onSurfaceColor,
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: onSurfaceColor,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: onSurfaceColor,
                        },
                    },
                },
                indexAxis: isSmallScreen ? "y" : "x",
            },
        });
    }
</script>

<svelte:head>
    <title>Your Stats • Discorver</title>
</svelte:head>

{#if loading}
    <center>
        <LoadingIndicator />
        <p>Give us a moment while we fetch a lot of data for you.</p>
    </center>
{:else}
    <h1>
        Your Guild Stats <Button
            variant="outlined"
            onclick={() => {
                window.location.hash = btoa(JSON.stringify(transformedData)); // TODO: Compress data (These are bloody massive)
                navigator.clipboard.writeText(window.location.href);

                snackbar("Share link copied to clipboard!", undefined, true);
            }}>Share</Button
        >
    </h1>
    <div class="chart-container">
        <canvas bind:this={rankPieChart}></canvas>
        <canvas bind:this={nameStartPieChart}></canvas>
    </div>
    <div class="chart-container single">
        <canvas bind:this={creationBarChart}></canvas>
    </div>
    <div class="chart-container single">
        <canvas bind:this={featureCountBarChart}></canvas>
    </div>
{/if}
<p class="small">
    Generated at {new Date(transformedData.generatedAt).toLocaleString()} with Discorver
    | Charts provided by Chart.js
</p>

<style>
    .chart-container {
        max-width: 90%;
        height: 40rem;
        max-height: 90%;
        margin: auto;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 24px;

        margin-top: 24px;

        background-color: rgb(var(--m3-scheme-surface));
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 1500px) {
        .chart-container {
            flex-direction: column;

            align-items: center;
            height: auto;
        }
    }

    .chart-container.single {
        height: 50rem;
        justify-content: center;
    }

    .single canvas {
        max-width: 100%;
        max-height: 100%;
    }

    canvas {
        max-width: 75%;
        max-height: 100%;
    }

    h1 {
        text-align: center;
        color: rgb(var(--m3-scheme-on-surface));
        margin-top: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
    }

    p.small {
        text-align: center;
        color: rgb(var(--m3-scheme-on-surface-variant));
        margin-top: 16px;
    }
</style>
