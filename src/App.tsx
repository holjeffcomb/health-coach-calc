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

interface Thresholds {
  aPlus: number | [number, number];
  b: number | [number, number];
  dMinus: number;
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

  // Scoring functions
  const getMetabolicScore = (data: FormData): number => {
    let totalScore = 0;
    let validMetrics = 0;

    // A1c scoring
    if (data.a1c) {
      const a1c = parseFloat(data.a1c);
      if (a1c < 5.7) totalScore += 100;
      else if (a1c <= 6.4) totalScore += 70;
      else totalScore += 30;
      validMetrics++;
    }

    // LDL scoring
    if (data.ldl) {
      const ldl = parseFloat(data.ldl);
      if (ldl < 100) totalScore += 100;
      else if (ldl <= 129) totalScore += 70;
      else totalScore += 30;
      validMetrics++;
    }

    // Lp(a) scoring
    if (data.lpa) {
      const lpa = parseFloat(data.lpa);
      if (lpa < 50) totalScore += 100;
      else if (lpa <= 100) totalScore += 70;
      else totalScore += 30;
      validMetrics++;
    }

    // ApoB scoring
    if (data.apoB) {
      const apoB = parseFloat(data.apoB);
      if (apoB < 80) totalScore += 100;
      else if (apoB <= 100) totalScore += 70;
      else totalScore += 30;
      validMetrics++;
    }

    // Blood pressure scoring
    if (data.systolic && data.diastolic) {
      const sys = parseFloat(data.systolic);
      const dia = parseFloat(data.diastolic);
      if (sys < 120 && dia < 80) totalScore += 100;
      else if (sys <= 129 && dia < 80) totalScore += 70;
      else totalScore += 30;
      validMetrics++;
    }

    // Waist/Height ratio scoring
    if (data.waistHeightRatio) {
      const ratio = parseFloat(data.waistHeightRatio);
      if (ratio < 0.5) totalScore += 100;
      else if (ratio <= 0.6) totalScore += 70;
      else totalScore += 30;
      validMetrics++;
    }

    return validMetrics > 0 ? totalScore / validMetrics : 0;
  };

  const getVO2MaxScore = (data: FormData): number => {
    if (!data.vo2Max || !data.age || !data.sex) return 0;

    const vo2 = parseFloat(data.vo2Max);
    const age = parseInt(data.age);
    const isMale = data.sex === "male";

    let thresholds: Thresholds = { aPlus: 0, b: 0, dMinus: 0 };

    if (age >= 20 && age <= 29) {
      thresholds = isMale
        ? { aPlus: 51, b: 40, dMinus: 35 }
        : { aPlus: 41, b: 30, dMinus: 27 };
    } else if (age >= 30 && age <= 39) {
      thresholds = isMale
        ? { aPlus: 47, b: 37, dMinus: 32 }
        : { aPlus: 37, b: 28, dMinus: 24 };
    } else if (age >= 40 && age <= 49) {
      thresholds = isMale
        ? { aPlus: 42, b: 32, dMinus: 28 }
        : { aPlus: 33, b: 25, dMinus: 21 };
    } else if (age >= 50 && age <= 59) {
      thresholds = isMale
        ? { aPlus: 37, b: 27, dMinus: 25 }
        : { aPlus: 29, b: 22, dMinus: 18 };
    } else if (age >= 60) {
      thresholds = isMale
        ? { aPlus: 30, b: 22, dMinus: 20 }
        : { aPlus: 25, b: 18, dMinus: 15 };
    }

    if (vo2 >= (thresholds.aPlus as number)) return 100;
    else if (vo2 >= (thresholds.b as number)) return 70;
    else return 30;
  };

  const getGripStrengthScore = (data: FormData): number => {
    if (!data.gripStrength || !data.age || !data.sex) return 0;

    const grip = parseFloat(data.gripStrength);
    const age = parseInt(data.age);
    const isMale = data.sex === "male";

    let thresholds: Thresholds = { aPlus: 0, b: 0, dMinus: 0 };

    if (age >= 20 && age <= 29) {
      thresholds = isMale
        ? { aPlus: 45, b: 35, dMinus: 35 }
        : { aPlus: 30, b: 20, dMinus: 20 };
    } else if (age >= 30 && age <= 39) {
      thresholds = isMale
        ? { aPlus: 43, b: 34, dMinus: 34 }
        : { aPlus: 29, b: 19, dMinus: 19 };
    } else if (age >= 40 && age <= 49) {
      thresholds = isMale
        ? { aPlus: 41, b: 32, dMinus: 32 }
        : { aPlus: 28, b: 18, dMinus: 18 };
    } else if (age >= 50 && age <= 59) {
      thresholds = isMale
        ? { aPlus: 39, b: 30, dMinus: 30 }
        : { aPlus: 26, b: 17, dMinus: 17 };
    } else if (age >= 60) {
      thresholds = isMale
        ? { aPlus: 35, b: 27, dMinus: 27 }
        : { aPlus: 24, b: 15, dMinus: 15 };
    }

    if (grip >= (thresholds.aPlus as number)) return 100;
    else if (grip >= (thresholds.b as number)) return 70;
    else return 30;
  };

  const getBodyCompositionScore = (data: FormData): number => {
    if (!data.bodyFat || !data.age || !data.sex) return 0;

    const bodyFat = parseFloat(data.bodyFat);
    const age = parseInt(data.age);
    const isMale = data.sex === "male";

    let thresholds: {
      aPlus: [number, number];
      b: [number, number];
      dMinus: number;
    } = { aPlus: [0, 0], b: [0, 0], dMinus: 0 };

    if (age >= 20 && age <= 29) {
      thresholds = isMale
        ? { aPlus: [8, 10.5], b: [10.6, 14.8], dMinus: 14.8 }
        : { aPlus: [14, 16.5], b: [16.6, 19.4], dMinus: 19.4 };
    } else if (age >= 30 && age <= 39) {
      thresholds = isMale
        ? { aPlus: [8, 14.5], b: [14.6, 18.2], dMinus: 18.2 }
        : { aPlus: [14, 17.4], b: [17.5, 20.8], dMinus: 20.8 };
    } else if (age >= 40 && age <= 49) {
      thresholds = isMale
        ? { aPlus: [8, 17.4], b: [17.5, 20.6], dMinus: 20.6 }
        : { aPlus: [14, 19.8], b: [19.9, 23.8], dMinus: 23.8 };
    } else if (age >= 50 && age <= 59) {
      thresholds = isMale
        ? { aPlus: [8, 19.1], b: [19.2, 22.1], dMinus: 22.1 }
        : { aPlus: [14, 22.5], b: [22.6, 27], dMinus: 27 };
    } else if (age >= 60 && age <= 69) {
      thresholds = isMale
        ? { aPlus: [8, 19.7], b: [19.8, 23.4], dMinus: 23.4 }
        : { aPlus: [14, 23.2], b: [23.3, 27.9], dMinus: 27.9 };
    } else if (age >= 70) {
      thresholds = isMale
        ? { aPlus: [8, 20.2], b: [20.3, 24.5], dMinus: 24.5 }
        : { aPlus: [14, 24.5], b: [24.6, 29], dMinus: 29 };
    }

    if (bodyFat >= thresholds.aPlus[0] && bodyFat <= thresholds.aPlus[1])
      return 100;
    else if (bodyFat >= thresholds.b[0] && bodyFat <= thresholds.b[1])
      return 70;
    else return 30;
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
    const metabolicScore = getMetabolicScore(formData);
    const vo2MaxScore = getVO2MaxScore(formData);
    const gripStrengthScore = getGripStrengthScore(formData);
    const bodyCompositionScore = getBodyCompositionScore(formData);

    // Calculate weighted total score
    const totalScore =
      metabolicScore * 0.35 +
      vo2MaxScore * 0.2 +
      gripStrengthScore * 0.1 +
      bodyCompositionScore * 0.2;

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

            {/* Metabolic Health (35%) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Metabolic Health (35%)
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    A1c (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.a1c}
                    onChange={(e) => handleInputChange("a1c", e.target.value)}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>
                <div className="col-span-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.45"
                  />
                </div>
              </div>
            </div>

            {/* VO2 Max (20%) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                VO2 Max - Cardio Fitness (20%)
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  VO2 Max (mL/kg/min)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vo2Max}
                  onChange={(e) => handleInputChange("vo2Max", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45"
                />
              </div>
            </div>

            {/* Grip Strength (10%) */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Grip Strength (10%)
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Grip Strength (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gripStrength}
                  onChange={(e) =>
                    handleInputChange("gripStrength", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="40"
                />
              </div>
            </div>

            {/* Body Composition (20%) */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Body Composition (20%)
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
                <span className="font-medium">Metabolic Health (35%)</span>
                <span className="font-bold text-blue-600">
                  {scores.metabolic}/100
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium">VO2 Max (20%)</span>
                <span className="font-bold text-green-600">
                  {scores.vo2Max}/100
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="font-medium">Grip Strength (10%)</span>
                <span className="font-bold text-purple-600">
                  {scores.gripStrength}/100
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="font-medium">Body Composition (20%)</span>
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
              <strong>Note:</strong> This calculator is based on scientific
              evidence from ADA, AHA, NHANES, Cooper Institute, NIH, and
              European Working Group on Sarcopenia. Results are for
              informational purposes only and should not replace professional
              medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessCalculator;
