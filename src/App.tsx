import React, { useState, useEffect } from "react";
import { Calculator, Heart, Activity, Dumbbell, Scale } from "lucide-react";

interface FormData {
  age: string;
  sex: string;
  a1c: string;
  ldl: string;
  lpa: string;
  apoB: string;
  systolic: string;
  diastolic: string;
  waistHeightRatio: string;
  vo2Max: string;
  gripStrength: string;
  bodyFat: string;
  smm: string;
}

interface Scores {
  metabolic: number;
  vo2Max: number;
  gripStrength: number;
  bodyComposition: number;
  total: number;
}

interface Grade {
  grade: string;
  meaning: string;
  color: string;
}

const WellnessCalculator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    age: "",
    sex: "",
    a1c: "",
    ldl: "",
    lpa: "",
    apoB: "",
    systolic: "",
    diastolic: "",
    waistHeightRatio: "",
    vo2Max: "",
    gripStrength: "",
    bodyFat: "",
    smm: "",
  });

  const [scores, setScores] = useState<Scores>({
    metabolic: 0,
    vo2Max: 0,
    gripStrength: 0,
    bodyComposition: 0,
    total: 0,
  });

  const [grade, setGrade] = useState<Grade>({
    grade: "",
    meaning: "",
    color: "",
  });

  // Fixed category weights per specifications
  const categoryWeights = {
    metabolicHealth: 0.41, // 41%
    vo2max: 0.24, // 24%
    gripStrength: 0.12, // 12%
    bodyComposition: 0.24, // 24%
  };

  // Sliding scale function for linear interpolation
  const getScoreFromRange = (
    value: number,
    low: number,
    high: number,
    lowScore: number,
    highScore: number
  ): number => {
    if (value <= low) return lowScore;
    if (value >= high) return highScore;
    return ((value - low) / (high - low)) * (highScore - lowScore) + lowScore;
  };

  // Score individual metabolic metrics with sliding scale
  const scoreMetabolicMetric = (
    value: number,
    thresholds: { excellent: number; good: number; poor: number },
    lowerIsBetter: boolean = true
  ): number => {
    if (lowerIsBetter) {
      if (value <= thresholds.excellent) return 100;
      if (value <= thresholds.good)
        return getScoreFromRange(
          value,
          thresholds.excellent,
          thresholds.good,
          100,
          70
        );
      if (value <= thresholds.poor)
        return getScoreFromRange(
          value,
          thresholds.good,
          thresholds.poor,
          70,
          50
        );
      return getScoreFromRange(
        value,
        thresholds.poor,
        thresholds.poor * 1.5,
        50,
        0
      );
    } else {
      if (value >= thresholds.excellent) return 100;
      if (value >= thresholds.good)
        return getScoreFromRange(
          value,
          thresholds.good,
          thresholds.excellent,
          70,
          100
        );
      if (value >= thresholds.poor)
        return getScoreFromRange(
          value,
          thresholds.poor,
          thresholds.good,
          50,
          70
        );
      return getScoreFromRange(
        value,
        thresholds.poor * 0.5,
        thresholds.poor,
        0,
        50
      );
    }
  };

  const getMetabolicScore = (data: FormData): number => {
    let totalScore = 0;
    let validMetrics = 0;

    // A1c scoring with sliding scale
    if (data.a1c) {
      const a1c = parseFloat(data.a1c);
      const score = scoreMetabolicMetric(a1c, {
        excellent: 5.7,
        good: 6.4,
        poor: 7.0,
      });
      totalScore += score;
      validMetrics++;
    }

    // LDL scoring with sliding scale
    if (data.ldl) {
      const ldl = parseFloat(data.ldl);
      const score = scoreMetabolicMetric(ldl, {
        excellent: 100,
        good: 129,
        poor: 160,
      });
      totalScore += score;
      validMetrics++;
    }

    // Lp(a) scoring with sliding scale
    if (data.lpa) {
      const lpa = parseFloat(data.lpa);
      const score = scoreMetabolicMetric(lpa, {
        excellent: 50,
        good: 100,
        poor: 150,
      });
      totalScore += score;
      validMetrics++;
    }

    // ApoB scoring with sliding scale
    if (data.apoB) {
      const apoB = parseFloat(data.apoB);
      const score = scoreMetabolicMetric(apoB, {
        excellent: 80,
        good: 100,
        poor: 120,
      });
      totalScore += score;
      validMetrics++;
    }

    // Blood pressure scoring with sliding scale
    if (data.systolic && data.diastolic) {
      const sys = parseFloat(data.systolic);
      const dia = parseFloat(data.diastolic);

      // Use systolic as primary measure, but factor in diastolic
      const sysScore = scoreMetabolicMetric(sys, {
        excellent: 120,
        good: 129,
        poor: 140,
      });
      const diaScore = scoreMetabolicMetric(dia, {
        excellent: 80,
        good: 84,
        poor: 90,
      });

      // Average the two scores
      const score = (sysScore + diaScore) / 2;
      totalScore += score;
      validMetrics++;
    }

    // Waist/Height ratio scoring with sliding scale
    if (data.waistHeightRatio) {
      const ratio = parseFloat(data.waistHeightRatio);
      const score = scoreMetabolicMetric(ratio, {
        excellent: 0.5,
        good: 0.6,
        poor: 0.7,
      });
      totalScore += score;
      validMetrics++;
    }

    return validMetrics > 0 ? totalScore / validMetrics : 0;
  };

  const getVO2MaxScore = (data: FormData): number => {
    if (!data.vo2Max || !data.age || !data.sex) return 0;

    const vo2 = parseFloat(data.vo2Max);
    const age = parseInt(data.age);
    const isMale = data.sex === "male";

    let thresholds = { excellent: 0, good: 0, poor: 0 };

    if (age >= 20 && age <= 29) {
      thresholds = isMale
        ? { excellent: 51, good: 40, poor: 35 }
        : { excellent: 41, good: 30, poor: 27 };
    } else if (age >= 30 && age <= 39) {
      thresholds = isMale
        ? { excellent: 47, good: 37, poor: 32 }
        : { excellent: 37, good: 28, poor: 24 };
    } else if (age >= 40 && age <= 49) {
      thresholds = isMale
        ? { excellent: 42, good: 32, poor: 28 }
        : { excellent: 33, good: 25, poor: 21 };
    } else if (age >= 50 && age <= 59) {
      thresholds = isMale
        ? { excellent: 37, good: 27, poor: 25 }
        : { excellent: 29, good: 22, poor: 18 };
    } else if (age >= 60) {
      thresholds = isMale
        ? { excellent: 30, good: 22, poor: 20 }
        : { excellent: 25, good: 18, poor: 15 };
    }

    return scoreMetabolicMetric(vo2, thresholds, false); // Higher is better for VO2 max
  };

  const getGripStrengthScore = (data: FormData): number => {
    if (!data.gripStrength || !data.age || !data.sex) return 0;

    const grip = parseFloat(data.gripStrength);
    const age = parseInt(data.age);
    const isMale = data.sex === "male";

    let thresholds = { excellent: 0, good: 0, poor: 0 };

    if (age >= 20 && age <= 29) {
      thresholds = isMale
        ? { excellent: 45, good: 35, poor: 30 }
        : { excellent: 30, good: 20, poor: 15 };
    } else if (age >= 30 && age <= 39) {
      thresholds = isMale
        ? { excellent: 43, good: 34, poor: 29 }
        : { excellent: 29, good: 19, poor: 14 };
    } else if (age >= 40 && age <= 49) {
      thresholds = isMale
        ? { excellent: 41, good: 32, poor: 27 }
        : { excellent: 28, good: 18, poor: 13 };
    } else if (age >= 50 && age <= 59) {
      thresholds = isMale
        ? { excellent: 39, good: 30, poor: 25 }
        : { excellent: 26, good: 17, poor: 12 };
    } else if (age >= 60) {
      thresholds = isMale
        ? { excellent: 35, good: 27, poor: 22 }
        : { excellent: 24, good: 15, poor: 10 };
    }

    return scoreMetabolicMetric(grip, thresholds, false); // Higher is better for grip strength
  };

  const getBodyCompositionScore = (data: FormData): number => {
    if (!data.bodyFat || !data.age || !data.sex) return 0;

    const bodyFat = parseFloat(data.bodyFat);
    const age = parseInt(data.age);
    const isMale = data.sex === "male";

    let optimalRange = { low: 0, high: 0 };
    let goodRange = { low: 0, high: 0 };
    let poorThreshold = 0;

    if (age >= 20 && age <= 29) {
      if (isMale) {
        optimalRange = { low: 8, high: 10.5 };
        goodRange = { low: 10.6, high: 14.8 };
        poorThreshold = 20;
      } else {
        optimalRange = { low: 14, high: 16.5 };
        goodRange = { low: 16.6, high: 19.4 };
        poorThreshold = 25;
      }
    } else if (age >= 30 && age <= 39) {
      if (isMale) {
        optimalRange = { low: 8, high: 14.5 };
        goodRange = { low: 14.6, high: 18.2 };
        poorThreshold = 22;
      } else {
        optimalRange = { low: 14, high: 17.4 };
        goodRange = { low: 17.5, high: 20.8 };
        poorThreshold = 27;
      }
    } else if (age >= 40 && age <= 49) {
      if (isMale) {
        optimalRange = { low: 8, high: 17.4 };
        goodRange = { low: 17.5, high: 20.6 };
        poorThreshold = 25;
      } else {
        optimalRange = { low: 14, high: 19.8 };
        goodRange = { low: 19.9, high: 23.8 };
        poorThreshold = 30;
      }
    } else if (age >= 50 && age <= 59) {
      if (isMale) {
        optimalRange = { low: 8, high: 19.1 };
        goodRange = { low: 19.2, high: 22.1 };
        poorThreshold = 27;
      } else {
        optimalRange = { low: 14, high: 22.5 };
        goodRange = { low: 22.6, high: 27 };
        poorThreshold = 32;
      }
    } else if (age >= 60 && age <= 69) {
      if (isMale) {
        optimalRange = { low: 8, high: 19.7 };
        goodRange = { low: 19.8, high: 23.4 };
        poorThreshold = 28;
      } else {
        optimalRange = { low: 14, high: 23.2 };
        goodRange = { low: 23.3, high: 27.9 };
        poorThreshold = 33;
      }
    } else if (age >= 70) {
      if (isMale) {
        optimalRange = { low: 8, high: 20.2 };
        goodRange = { low: 20.3, high: 24.5 };
        poorThreshold = 30;
      } else {
        optimalRange = { low: 14, high: 24.5 };
        goodRange = { low: 24.6, high: 29 };
        poorThreshold = 35;
      }
    }

    // Body fat scoring logic
    if (bodyFat >= optimalRange.low && bodyFat <= optimalRange.high) {
      return 100;
    } else if (bodyFat >= goodRange.low && bodyFat <= goodRange.high) {
      return getScoreFromRange(bodyFat, goodRange.low, goodRange.high, 70, 89);
    } else if (bodyFat < optimalRange.low) {
      // Too low body fat
      return getScoreFromRange(
        bodyFat,
        Math.max(0, optimalRange.low - 5),
        optimalRange.low,
        50,
        100
      );
    } else if (bodyFat > goodRange.high && bodyFat <= poorThreshold) {
      return getScoreFromRange(bodyFat, goodRange.high, poorThreshold, 70, 50);
    } else {
      // Very high body fat
      return getScoreFromRange(
        bodyFat,
        poorThreshold,
        poorThreshold * 1.2,
        50,
        0
      );
    }
  };

  const getGradeFromScore = (score: number): Grade => {
    if (score >= 90)
      return {
        grade: "A+",
        meaning: "Optimal – Best outcome range",
        color: "text-green-600",
      };
    else if (score >= 80)
      return {
        grade: "A",
        meaning: "Excellent – Minimal improvement needed",
        color: "text-green-500",
      };
    else if (score >= 70)
      return {
        grade: "B",
        meaning: "Good – Room for improvement",
        color: "text-yellow-500",
      };
    else if (score >= 60)
      return {
        grade: "C",
        meaning: "Moderate risk – Action needed",
        color: "text-orange-500",
      };
    else if (score >= 50)
      return {
        grade: "D",
        meaning: "High risk – Significant change needed",
        color: "text-red-500",
      };
    else
      return {
        grade: "F",
        meaning: "Critical risk – Immediate support recommended",
        color: "text-red-600",
      };
  };

  useEffect(() => {
    const metabolicScore = Math.min(100, getMetabolicScore(formData));
    const vo2MaxScore = Math.min(100, getVO2MaxScore(formData));
    const gripStrengthScore = Math.min(100, getGripStrengthScore(formData));
    const bodyCompositionScore = Math.min(
      100,
      getBodyCompositionScore(formData)
    );

    // Calculate weighted total score using correct weights (41/24/12/24)
    const totalScore = Math.min(
      100,
      metabolicScore * categoryWeights.metabolicHealth +
        vo2MaxScore * categoryWeights.vo2max +
        gripStrengthScore * categoryWeights.gripStrength +
        bodyCompositionScore * categoryWeights.bodyComposition
    );

    const newScores = {
      metabolic: Math.round(metabolicScore),
      vo2Max: Math.round(vo2MaxScore),
      gripStrength: Math.round(gripStrengthScore),
      bodyComposition: Math.round(bodyCompositionScore),
      total: Math.round(totalScore),
    };

    setScores(newScores);
    setGrade(getGradeFromScore(newScores.total));
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  // Test scenarios for validation
  const testScenarios = {
    healthyYoungMale: {
      age: "25",
      sex: "male",
      a1c: "5.2",
      ldl: "85",
      lpa: "35",
      apoB: "75",
      systolic: "115",
      diastolic: "75",
      waistHeightRatio: "0.45",
      vo2Max: "52",
      gripStrength: "47",
      bodyFat: "12",
      smm: "",
    },
    healthyYoungFemale: {
      age: "25",
      sex: "female",
      a1c: "5.1",
      ldl: "90",
      lpa: "40",
      apoB: "78",
      systolic: "110",
      diastolic: "70",
      waistHeightRatio: "0.42",
      vo2Max: "42",
      gripStrength: "32",
      bodyFat: "18",
      smm: "",
    },
    healthyMiddleAgedMale: {
      age: "45",
      sex: "male",
      a1c: "5.4",
      ldl: "95",
      lpa: "45",
      apoB: "80",
      systolic: "120",
      diastolic: "78",
      waistHeightRatio: "0.48",
      vo2Max: "44",
      gripStrength: "42",
      bodyFat: "16",
      smm: "",
    },
    healthyMiddleAgedFemale: {
      age: "45",
      sex: "female",
      a1c: "5.3",
      ldl: "98",
      lpa: "42",
      apoB: "82",
      systolic: "118",
      diastolic: "76",
      waistHeightRatio: "0.46",
      vo2Max: "35",
      gripStrength: "29",
      bodyFat: "22",
      smm: "",
    },
    unhealthyMale: {
      age: "40",
      sex: "male",
      a1c: "7.2",
      ldl: "165",
      lpa: "120",
      apoB: "125",
      systolic: "145",
      diastolic: "92",
      waistHeightRatio: "0.65",
      vo2Max: "28",
      gripStrength: "28",
      bodyFat: "28",
      smm: "",
    },
    unhealthyFemale: {
      age: "38",
      sex: "female",
      a1c: "6.8",
      ldl: "155",
      lpa: "110",
      apoB: "115",
      systolic: "140",
      diastolic: "88",
      waistHeightRatio: "0.62",
      vo2Max: "22",
      gripStrength: "16",
      bodyFat: "32",
      smm: "",
    },
    elderlyHealthyMale: {
      age: "65",
      sex: "male",
      a1c: "5.6",
      ldl: "105",
      lpa: "55",
      apoB: "85",
      systolic: "125",
      diastolic: "80",
      waistHeightRatio: "0.52",
      vo2Max: "32",
      gripStrength: "36",
      bodyFat: "20",
      smm: "",
    },
    elderlyHealthyFemale: {
      age: "65",
      sex: "female",
      a1c: "5.5",
      ldl: "110",
      lpa: "50",
      apoB: "88",
      systolic: "122",
      diastolic: "78",
      waistHeightRatio: "0.50",
      vo2Max: "26",
      gripStrength: "25",
      bodyFat: "24",
      smm: "",
    },
    athleticMale: {
      age: "30",
      sex: "male",
      a1c: "4.9",
      ldl: "75",
      lpa: "25",
      apoB: "65",
      systolic: "110",
      diastolic: "68",
      waistHeightRatio: "0.42",
      vo2Max: "58",
      gripStrength: "52",
      bodyFat: "8",
      smm: "",
    },
    sedentaryPerson: {
      age: "35",
      sex: "male",
      a1c: "6.1",
      ldl: "140",
      lpa: "85",
      apoB: "105",
      systolic: "135",
      diastolic: "85",
      waistHeightRatio: "0.58",
      vo2Max: "25",
      gripStrength: "25",
      bodyFat: "25",
      smm: "",
    },
  };

  const loadTestScenario = (scenario: keyof typeof testScenarios) => {
    setFormData(testScenarios[scenario]);
  };

  const clearForm = () => {
    setFormData({
      age: "",
      sex: "",
      a1c: "",
      ldl: "",
      lpa: "",
      apoB: "",
      systolic: "",
      diastolic: "",
      waistHeightRatio: "",
      vo2Max: "",
      gripStrength: "",
      bodyFat: "",
      smm: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Metabolic Health & Longevity Scorecard
            </h1>
          </div>

          {/* Testing Panel */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              🧪 Quick Test Scenarios
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                onClick={() => loadTestScenario("healthyYoungMale")}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
              >
                Healthy Young ♂
              </button>
              <button
                onClick={() => loadTestScenario("healthyYoungFemale")}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
              >
                Healthy Young ♀
              </button>
              <button
                onClick={() => loadTestScenario("healthyMiddleAgedMale")}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
              >
                Healthy Mid-Age ♂
              </button>
              <button
                onClick={() => loadTestScenario("healthyMiddleAgedFemale")}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
              >
                Healthy Mid-Age ♀
              </button>
              <button
                onClick={() => loadTestScenario("elderlyHealthyMale")}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors"
              >
                Healthy Senior ♂
              </button>
              <button
                onClick={() => loadTestScenario("elderlyHealthyFemale")}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors"
              >
                Healthy Senior ♀
              </button>
              <button
                onClick={() => loadTestScenario("athleticMale")}
                className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-medium transition-colors"
              >
                🏃‍♂️ Athletic Male
              </button>
              <button
                onClick={() => loadTestScenario("unhealthyMale")}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
              >
                ⚠️ Unhealthy ♂
              </button>
              <button
                onClick={() => loadTestScenario("unhealthyFemale")}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
              >
                ⚠️ Unhealthy ♀
              </button>
              <button
                onClick={() => loadTestScenario("sedentaryPerson")}
                className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-medium transition-colors"
              >
                💺 Sedentary
              </button>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearForm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Form
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Basic Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Sex
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleInputChange("sex", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metabolic Health (41%) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Metabolic Health (41%)
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    A1c (%)
                  </label>
                  <input
                    type="number"
                    value={formData.a1c}
                    onChange={(e) => handleInputChange("a1c", e.target.value)}
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5.4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    LDL (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={formData.ldl}
                    onChange={(e) => handleInputChange("ldl", e.target.value)}
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Lp(a) (nmol/L)
                  </label>
                  <input
                    type="number"
                    value={formData.lpa}
                    onChange={(e) => handleInputChange("lpa", e.target.value)}
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    ApoB (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={formData.apoB}
                    onChange={(e) => handleInputChange("apoB", e.target.value)}
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Systolic BP
                  </label>
                  <input
                    type="number"
                    value={formData.systolic}
                    onChange={(e) =>
                      handleInputChange("systolic", e.target.value)
                    }
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="115"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Diastolic BP
                  </label>
                  <input
                    type="number"
                    value={formData.diastolic}
                    onChange={(e) =>
                      handleInputChange("diastolic", e.target.value)
                    }
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Waist/Height Ratio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.waistHeightRatio}
                    onChange={(e) =>
                      handleInputChange("waistHeightRatio", e.target.value)
                    }
                    onWheel={handleWheel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.45"
                  />
                </div>
              </div>
            </div>

            {/* VO2 Max (24%) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                VO2 Max - Cardio Fitness (24%)
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  VO2 Max (mL/kg/min)
                </label>
                <input
                  type="number"
                  value={formData.vo2Max}
                  onChange={(e) => handleInputChange("vo2Max", e.target.value)}
                  onWheel={handleWheel}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45"
                />
              </div>
            </div>

            {/* Grip Strength (12%) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Grip Strength (12%)
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Grip Strength (kg)
                </label>
                <input
                  type="number"
                  value={formData.gripStrength}
                  onChange={(e) =>
                    handleInputChange("gripStrength", e.target.value)
                  }
                  onWheel={handleWheel}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="40"
                />
              </div>
            </div>

            {/* Body Composition (24%) */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Body Composition (24%)
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Body Fat (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) =>
                      handleInputChange("bodyFat", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Health & Longevity Score
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Metabolic Health (41%)</span>
                <span className="font-bold text-blue-600">
                  {scores.metabolic}/100
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium">VO2 Max (24%)</span>
                <span className="font-bold text-green-600">
                  {scores.vo2Max}/100
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="font-medium">Grip Strength (12%)</span>
                <span className="font-bold text-purple-600">
                  {scores.gripStrength}/100
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="font-medium">Body Composition (24%)</span>
                <span className="font-bold text-orange-600">
                  {scores.bodyComposition}/100
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center">
              <div className="text-center">
                <div
                  className="text-6xl font-bold mb-2"
                  style={{
                    color: grade.color?.replace("text-", "") || "#6B7280",
                  }}
                >
                  {scores.total}
                </div>
                <div className="text-xl text-gray-600 mb-4">Total Score</div>
                <div className={`text-3xl font-bold mb-2 ${grade.color}`}>
                  {grade.grade}
                </div>
                <div className="text-gray-600 text-center max-w-xs">
                  {grade.meaning}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This calculator uses evidence-based sliding
              scale scoring with proportional weighting (41% metabolic, 24% VO2
              max, 12% grip strength, 24% body composition). Based on research
              from ADA, AHA, NHANES, Cooper Institute, NIH, and European Working
              Group on Sarcopenia. Results are for informational purposes only
              and should not replace professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCalculator;
