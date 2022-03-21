import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import tw from 'tailwind-react-native-classnames';

export default function Statistic({ statistic }) {
  const screenWidth = Dimensions.get("window").width
  const data = {
    labels: ['Du', 'Totalt'],
    legend: ['Färdiga Sysslor', 'Inte färdiga'],
    data: [
      [statistic.completedChores, statistic.notCompletedChores],
      [statistic.totalCompletedChores, statistic.totalNotCompletedChores],
    ],
    barColors: ["#8DD4A4", "#42A8D2"]
  }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <View>
      {statistic.totalAddedChores > 0 ? (
        <View>
          <View style={tw.style('flex flex-row justify-between px-2 mb-10 mt-5')}>
          <Text style={tw.style('font-bold text-xl')}>Statisitik</Text>
            <View style={tw.style('flex flex-col')}>
              <Text style={tw.style('font-bold text-sm tracking-wide')}>Tillagda av dig</Text>
              <Text style={tw.style('font-bold text-sm tracking-wide')}>{statistic.addedChores}</Text>
            </View>
            <View style={tw.style('flex flex-col')}>
              <Text style={tw.style('font-bold text-sm tracking-wide')}>Totalt tillagda</Text>
              <Text style={tw.style('font-bold text-sm tracking-wide')}>{statistic.totalAddedChores}</Text>
            </View>
          </View>
          <StackedBarChart
            withHorizontalLabels={false}
            data={data}
            width={screenWidth}
            height={300}
            chartConfig={chartConfig}
          />
        </View>
      ) : (
        <View>
          <Text>Lägg till sysslor för att kunna se statistik!</Text>
        </View>
      )}
      
    </View>
  )
}
