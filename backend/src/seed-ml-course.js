// Seed script for Machine Learning Fundamentals course
// Using CampusX "100 Days of ML" playlist
// Run with: node src/seed-ml-course.js
// DELETE THIS FILE AFTER RUNNING

import mongoose from "mongoose";
import { Section } from "./models/section.model.js";
import { Lesson } from "./models/lesson.model.js";
import dotenv from "dotenv";

dotenv.config();

const COURSE_ID = "6966a32b8b71ae7b0fd7fa69";

// Parse duration string like "20:00" or "1:15:20" to seconds
const parseDuration = (timeStr) => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
};

const sections = [
    {
        title: "Introduction to Machine Learning",
        order: 1,
        lessons: [
            { title: "What is Machine Learning?", videoUrl: "https://www.youtube.com/watch?v=ZftI2fEz0Fw", duration: parseDuration("20:00"), order: 1 },
            { title: "AI Vs ML Vs DL for Beginners in Hindi", videoUrl: "https://www.youtube.com/watch?v=1v3_AQ26jZ0", duration: parseDuration("16:02"), order: 2 },
            { title: "Types of Machine Learning for Beginners", videoUrl: "https://www.youtube.com/watch?v=81ymPYEtFOw", duration: parseDuration("27:42"), order: 3 },
            { title: "Batch Machine Learning | Offline Vs Online Learning", videoUrl: "https://www.youtube.com/watch?v=nPrhFxEuTYU", duration: parseDuration("11:28"), order: 4 },
            { title: "Online Machine Learning | Online Vs Offline ML", videoUrl: "https://www.youtube.com/watch?v=3oOipgCbLIk", duration: parseDuration("19:28"), order: 5 },
            { title: "Instance-Based Vs Model-Based Learning", videoUrl: "https://www.youtube.com/watch?v=ntAOq1ioTKo", duration: parseDuration("16:44"), order: 6 },
            { title: "Challenges in Machine Learning", videoUrl: "https://www.youtube.com/watch?v=WGUNAJki2S4", duration: parseDuration("23:40"), order: 7 },
            { title: "Application of Machine Learning", videoUrl: "https://www.youtube.com/watch?v=UZio8TcTMrI", duration: parseDuration("29:02"), order: 8 },
            { title: "Machine Learning Development Life Cycle", videoUrl: "https://www.youtube.com/watch?v=iDbhQGz_rEo", duration: parseDuration("25:13"), order: 9 },
            { title: "Data Engineer Vs Data Analyst Vs Data Scientist Vs ML Engineer", videoUrl: "https://www.youtube.com/watch?v=93rKZs0MkgU", duration: parseDuration("26:23"), order: 10 },
        ],
    },
    {
        title: "Getting Started with ML",
        order: 2,
        lessons: [
            { title: "What are Tensors | Tensor In-depth Explanation", videoUrl: "https://www.youtube.com/watch?v=vVhD2EyS41Y", duration: parseDuration("41:29"), order: 1 },
            { title: "Installing Anaconda | Jupyter Notebook | Google Colab", videoUrl: "https://www.youtube.com/watch?v=82P5N2m41jE", duration: parseDuration("37:06"), order: 2 },
            { title: "End to End Toy Project | Day 13", videoUrl: "https://www.youtube.com/watch?v=dr7z7a_8lQw", duration: parseDuration("30:43"), order: 3 },
            { title: "How to Frame a Machine Learning Problem", videoUrl: "https://www.youtube.com/watch?v=A9SezQlvakw", duration: parseDuration("22:22"), order: 4 },
            { title: "Working with CSV files | Day 15", videoUrl: "https://www.youtube.com/watch?v=a_XrmKlaGTs", duration: parseDuration("36:30"), order: 5 },
            { title: "Working with JSON/SQL | Day 16", videoUrl: "https://www.youtube.com/watch?v=fFwRC-fapIU", duration: parseDuration("17:00"), order: 6 },
            { title: "Fetching Data From an API | Day 17", videoUrl: "https://www.youtube.com/watch?v=roTZJaxjnJc", duration: parseDuration("22:50"), order: 7 },
            { title: "Fetching data using Web Scraping | Day 18", videoUrl: "https://www.youtube.com/watch?v=8NOdgjC1988", duration: parseDuration("37:49"), order: 8 },
        ],
    },
    {
        title: "Exploratory Data Analysis",
        order: 3,
        lessons: [
            { title: "Understanding Your Data | Day 19", videoUrl: "https://www.youtube.com/watch?v=mJlRTUuVr04", duration: parseDuration("15:23"), order: 1 },
            { title: "EDA using Univariate Analysis | Day 20", videoUrl: "https://www.youtube.com/watch?v=4HyTlbHUKSw", duration: parseDuration("30:31"), order: 2 },
            { title: "EDA using Bivariate and Multivariate Analysis | Day 21", videoUrl: "https://www.youtube.com/watch?v=6D3VtEfCw7w", duration: parseDuration("38:03"), order: 3 },
            { title: "Pandas Profiling | Day 22", videoUrl: "https://www.youtube.com/watch?v=E69Lg2ZgOxg", duration: parseDuration("13:04"), order: 4 },
        ],
    },
    {
        title: "Feature Engineering",
        order: 4,
        lessons: [
            { title: "What is Feature Engineering | Day 23", videoUrl: "https://www.youtube.com/watch?v=sluoVhT0ehg", duration: parseDuration("24:52"), order: 1 },
            { title: "Feature Scaling - Standardization | Day 24", videoUrl: "https://www.youtube.com/watch?v=1Yw9sC0PNwY", duration: parseDuration("32:38"), order: 2 },
            { title: "Feature Scaling - Normalization | MinMaxScaling", videoUrl: "https://www.youtube.com/watch?v=eBrGyuA2MIg", duration: parseDuration("23:31"), order: 3 },
            { title: "Encoding Categorical Data | Ordinal Encoding | Label Encoding", videoUrl: "https://www.youtube.com/watch?v=w2GglmYHfmM", duration: parseDuration("19:53"), order: 4 },
            { title: "One Hot Encoding | Handling Categorical Data | Day 27", videoUrl: "https://www.youtube.com/watch?v=U5oCv3JKWKA", duration: parseDuration("30:12"), order: 5 },
            { title: "Column Transformer in Machine Learning", videoUrl: "https://www.youtube.com/watch?v=5TVj6iEBR4I", duration: parseDuration("15:41"), order: 6 },
            { title: "Machine Learning Pipelines A-Z | Day 29", videoUrl: "https://www.youtube.com/watch?v=xOccYkgRV4Q", duration: parseDuration("45:39"), order: 7 },
            { title: "Function Transformer | Log Transform | Reciprocal Transform", videoUrl: "https://www.youtube.com/watch?v=cTjj3LE8E90", duration: parseDuration("32:13"), order: 8 },
            { title: "Power Transformer | Box-Cox Transform | Yeo-Johnson Transform", videoUrl: "https://www.youtube.com/watch?v=lV_Z4HbNAx0", duration: parseDuration("21:28"), order: 9 },
            { title: "Binning and Binarization | Discretization | Quantile Binning", videoUrl: "https://www.youtube.com/watch?v=kKWsJGKcMvo", duration: parseDuration("38:25"), order: 10 },
            { title: "Handling Mixed Variables", videoUrl: "https://www.youtube.com/watch?v=9xiX-I5_LQY", duration: parseDuration("12:10"), order: 11 },
            { title: "Handling Date and Time Variables | Day 34", videoUrl: "https://www.youtube.com/watch?v=J73mvgG9fFs", duration: parseDuration("14:18"), order: 12 },
        ],
    },
    {
        title: "Handling Missing Data",
        order: 5,
        lessons: [
            { title: "Handling Missing Data | Part 1 | Complete Case Analysis", videoUrl: "https://www.youtube.com/watch?v=aUnNWZorGmk", duration: parseDuration("24:54"), order: 1 },
            { title: "Handling missing data | Numerical Data | Simple Imputer", videoUrl: "https://www.youtube.com/watch?v=mCL2xLBDw8M", duration: parseDuration("31:21"), order: 2 },
            { title: "Handling Missing Categorical Data | Most Frequent Imputation", videoUrl: "https://www.youtube.com/watch?v=l_Wip8bEDFQ", duration: parseDuration("13:34"), order: 3 },
            { title: "Missing Indicator | Random Sample Imputation | Part 4", videoUrl: "https://www.youtube.com/watch?v=Ratcir3p03w", duration: parseDuration("37:05"), order: 4 },
            { title: "KNN Imputer | Multivariate Imputation | Part 5", videoUrl: "https://www.youtube.com/watch?v=-fK-xEev2I8", duration: parseDuration("24:27"), order: 5 },
            { title: "MICE Algorithm | Iterative Imputer", videoUrl: "https://www.youtube.com/watch?v=a38ehxv3kyk", duration: parseDuration("18:31"), order: 6 },
        ],
    },
    {
        title: "Outlier Detection and Removal",
        order: 6,
        lessons: [
            { title: "What are Outliers | Outliers in Machine Learning", videoUrl: "https://www.youtube.com/watch?v=Lln1PKgGr_M", duration: parseDuration("17:07"), order: 1 },
            { title: "Outlier Detection using Z-score Method | Part 2", videoUrl: "https://www.youtube.com/watch?v=OnPE-Z8jtqM", duration: parseDuration("17:46"), order: 2 },
            { title: "Outlier Detection using the IQR Method | Part 3", videoUrl: "https://www.youtube.com/watch?v=Ccv1-W5ilak", duration: parseDuration("14:05"), order: 3 },
            { title: "Outlier Detection using the Percentile Method | Winsorization", videoUrl: "https://www.youtube.com/watch?v=bcXA4CqRXvM", duration: parseDuration("16:23"), order: 4 },
        ],
    },
    {
        title: "Dimensionality Reduction",
        order: 7,
        lessons: [
            { title: "Feature Construction | Feature Splitting", videoUrl: "https://www.youtube.com/watch?v=ma-h30PoFms", duration: parseDuration("12:22"), order: 1 },
            { title: "Curse of Dimensionality", videoUrl: "https://www.youtube.com/watch?v=ToGuhynu-No", duration: parseDuration("15:25"), order: 2 },
            { title: "PCA Part 1 | Geometric Intuition", videoUrl: "https://www.youtube.com/watch?v=iRbsBi5W0-c", duration: parseDuration("33:54"), order: 3 },
            { title: "PCA Part 2 | Problem Formulation and Step by Step Solution", videoUrl: "https://www.youtube.com/watch?v=tXXnxjj2wM4", duration: parseDuration("56:17"), order: 4 },
            { title: "PCA Part 3 | Code Example and Visualization", videoUrl: "https://www.youtube.com/watch?v=tofVCUDrg4M", duration: parseDuration("43:26"), order: 5 },
        ],
    },
    {
        title: "Linear Regression",
        order: 8,
        lessons: [
            { title: "Simple Linear Regression | Code + Intuition", videoUrl: "https://www.youtube.com/watch?v=UZPfbG0jNec", duration: parseDuration("33:36"), order: 1 },
            { title: "Simple Linear Regression | Mathematical Formulation | Scratch", videoUrl: "https://www.youtube.com/watch?v=dXHIDLPKdmA", duration: parseDuration("53:31"), order: 2 },
            { title: "Regression Metrics | MSE, MAE & RMSE | R2 Score", videoUrl: "https://www.youtube.com/watch?v=Ti7c-Hz7GSM", duration: parseDuration("43:56"), order: 3 },
            { title: "Multiple Linear Regression | Geometric Intuition & Code", videoUrl: "https://www.youtube.com/watch?v=ashGekqstl8", duration: parseDuration("20:57"), order: 4 },
            { title: "Multiple Linear Regression Part 2 | Mathematical Formulation", videoUrl: "https://www.youtube.com/watch?v=NU37mF5q8VE", duration: parseDuration("48:11"), order: 5 },
            { title: "Multiple Linear Regression Part 3 | Code From Scratch", videoUrl: "https://www.youtube.com/watch?v=VmZWXzxmNrE", duration: parseDuration("16:01"), order: 6 },
            { title: "Assumptions of Linear Regression | Top 5 Assumptions", videoUrl: "https://www.youtube.com/watch?v=EmSNAtcHLm8", duration: parseDuration("17:38"), order: 7 },
        ],
    },
    {
        title: "Gradient Descent",
        order: 9,
        lessons: [
            { title: "Gradient Descent From Scratch | End to End", videoUrl: "https://www.youtube.com/watch?v=ORyfPJypKuU", duration: parseDuration("1:57:56"), order: 1 },
            { title: "Batch Gradient Descent with Code Demo", videoUrl: "https://www.youtube.com/watch?v=Jyo53pAyVAM", duration: parseDuration("1:04:49"), order: 2 },
            { title: "Stochastic Gradient Descent", videoUrl: "https://www.youtube.com/watch?v=V7KBAa_gh4c", duration: parseDuration("49:35"), order: 3 },
            { title: "Mini-Batch Gradient Descent", videoUrl: "https://www.youtube.com/watch?v=_scscQ4HVTY", duration: parseDuration("22:10"), order: 4 },
        ],
    },
    {
        title: "Polynomial & Regularized Regression",
        order: 10,
        lessons: [
            { title: "Polynomial Regression | Machine Learning", videoUrl: "https://www.youtube.com/watch?v=BNWLf3cKdbQ", duration: parseDuration("26:46"), order: 1 },
            { title: "Bias Variance Trade-off | Overfitting and Underfitting", videoUrl: "https://www.youtube.com/watch?v=74DU02Fyrhk", duration: parseDuration("08:05"), order: 2 },
            { title: "Ridge Regression Part 1 | Geometric Intuition and Code", videoUrl: "https://www.youtube.com/watch?v=aEow1QoTLo0", duration: parseDuration("19:58"), order: 3 },
            { title: "Ridge Regression Part 2 | Mathematical Formulation & Scratch", videoUrl: "https://www.youtube.com/watch?v=oDlZBQjk_3A", duration: parseDuration("43:41"), order: 4 },
            { title: "Ridge Regression Part 3 | Gradient Descent", videoUrl: "https://www.youtube.com/watch?v=Fci_wwMp8G8", duration: parseDuration("18:43"), order: 5 },
            { title: "Ridge Regression Part 4 | 5 Key Points", videoUrl: "https://www.youtube.com/watch?v=8osKeShYVRQ", duration: parseDuration("30:17"), order: 6 },
            { title: "Lasso Regression | Intuition and Code Sample", videoUrl: "https://www.youtube.com/watch?v=HLF4bFbBgwk", duration: parseDuration("28:37"), order: 7 },
            { title: "Why Lasso Regression creates sparsity?", videoUrl: "https://www.youtube.com/watch?v=FN4aZPIAfI4", duration: parseDuration("24:30"), order: 8 },
            { title: "ElasticNet Regression | Intuition and Code Example", videoUrl: "https://www.youtube.com/watch?v=2g2DBkFhTTY", duration: parseDuration("11:41"), order: 9 },
        ],
    },
    {
        title: "Logistic Regression",
        order: 11,
        lessons: [
            { title: "Logistic Regression Part 1 | Perceptron Trick", videoUrl: "https://www.youtube.com/watch?v=XNXzVfItWGY", duration: parseDuration("47:06"), order: 1 },
            { title: "Logistic Regression Part 2 | Perceptron Trick Code", videoUrl: "https://www.youtube.com/watch?v=tLezwPKvPK4", duration: parseDuration("17:07"), order: 2 },
            { title: "Logistic Regression Part 3 | Sigmoid Function", videoUrl: "https://www.youtube.com/watch?v=ehO0-6i9qD4", duration: parseDuration("40:44"), order: 3 },
            { title: "Logistic Regression Part 4 | Loss Function | Binary Cross Entropy", videoUrl: "https://www.youtube.com/watch?v=6bXOo0sxY5c", duration: parseDuration("29:03"), order: 4 },
            { title: "Derivative of Sigmoid Function", videoUrl: "https://www.youtube.com/watch?v=awjXaFR1jOM", duration: parseDuration("05:57"), order: 5 },
            { title: "Logistic Regression Part 5 | Gradient Descent & Code From Scratch", videoUrl: "https://www.youtube.com/watch?v=ABrrSwMYWSg", duration: parseDuration("36:42"), order: 6 },
            { title: "Softmax Regression | Multinomial Logistic Regression | Part 6", videoUrl: "https://www.youtube.com/watch?v=Z8noL_0M4tw", duration: parseDuration("38:21"), order: 7 },
            { title: "Polynomial Features in Logistic Regression | Part 7", videoUrl: "https://www.youtube.com/watch?v=WnBYW_DX3sM", duration: parseDuration("09:11"), order: 8 },
            { title: "Logistic Regression Hyperparameters | Part 8", videoUrl: "https://www.youtube.com/watch?v=ay_OcblJasE", duration: parseDuration("13:07"), order: 9 },
        ],
    },
    {
        title: "Classification Metrics",
        order: 12,
        lessons: [
            { title: "Accuracy and Confusion Matrix | Type 1 and Type 2 Errors | Part 1", videoUrl: "https://www.youtube.com/watch?v=c09drtuCS3c", duration: parseDuration("34:08"), order: 1 },
            { title: "Precision, Recall and F1 Score | Part 2", videoUrl: "https://www.youtube.com/watch?v=iK-kdhJ-7yI", duration: parseDuration("42:42"), order: 2 },
            { title: "ROC Curve in Machine Learning | ROC-AUC Simplified", videoUrl: "https://www.youtube.com/watch?v=gdW6hj9IXaA", duration: parseDuration("1:11:15"), order: 3 },
        ],
    },
    {
        title: "Decision Trees",
        order: 13,
        lessons: [
            { title: "Decision Trees | Entropy | Gini impurity | Information Gain", videoUrl: "https://www.youtube.com/watch?v=IZnno-dKgVQ", duration: parseDuration("58:29"), order: 1 },
            { title: "Decision Trees - Hyperparameters | Overfitting and Underfitting", videoUrl: "https://www.youtube.com/watch?v=mDEV0Iucwz0", duration: parseDuration("27:23"), order: 2 },
            { title: "Regression Trees | Decision Trees Part 3", videoUrl: "https://www.youtube.com/watch?v=RANHxyAvtM4", duration: parseDuration("35:15"), order: 3 },
            { title: "Decision Tree Visualization using dtreeviz library", videoUrl: "https://www.youtube.com/watch?v=SlMZqfvl5uw", duration: parseDuration("18:36"), order: 4 },
        ],
    },
    {
        title: "Ensemble Learning - Voting & Bagging",
        order: 14,
        lessons: [
            { title: "Introduction to Ensemble Learning", videoUrl: "https://www.youtube.com/watch?v=bHK1fE_BUms", duration: parseDuration("37:43"), order: 1 },
            { title: "Voting Ensemble | Introduction and Core Idea | Part 1", videoUrl: "https://www.youtube.com/watch?v=_W1i-c_6rOk", duration: parseDuration("16:30"), order: 2 },
            { title: "Voting Ensemble | Classification | Hard vs Soft Voting | Part 2", videoUrl: "https://www.youtube.com/watch?v=pGQnNYdPTvY", duration: parseDuration("23:50"), order: 3 },
            { title: "Voting Ensemble | Regression | Part 3", videoUrl: "https://www.youtube.com/watch?v=ut4vh59rGkw", duration: parseDuration("10:57"), order: 4 },
            { title: "Bagging | Introduction | Part 1", videoUrl: "https://www.youtube.com/watch?v=LUiBOAy7x6Y", duration: parseDuration("31:13"), order: 5 },
            { title: "Bagging Ensemble | Part 2 | Bagging Classifiers", videoUrl: "https://www.youtube.com/watch?v=-1T54G_E-ys", duration: parseDuration("22:32"), order: 6 },
            { title: "Bagging Ensemble | Part 3 | Bagging Regressor", videoUrl: "https://www.youtube.com/watch?v=HYVzrETXbkE", duration: parseDuration("10:55"), order: 7 },
            { title: "Bagging Vs Boosting | Difference", videoUrl: "https://www.youtube.com/watch?v=7M5oWXCpDEw", duration: parseDuration("06:17"), order: 8 },
        ],
    },
    {
        title: "Random Forest",
        order: 15,
        lessons: [
            { title: "Introduction to Random Forest | Intuition", videoUrl: "https://www.youtube.com/watch?v=F9uESCHGjhA", duration: parseDuration("33:55"), order: 1 },
            { title: "How Random Forest Performs So Well?", videoUrl: "https://www.youtube.com/watch?v=jHgG4gjuFAk", duration: parseDuration("12:52"), order: 2 },
            { title: "Bagging Vs Random Forest | Difference", videoUrl: "https://www.youtube.com/watch?v=l93jRojZMqU", duration: parseDuration("12:02"), order: 3 },
            { title: "Random Forest Hyper-parameters", videoUrl: "https://www.youtube.com/watch?v=WOFVY_wQ9wU", duration: parseDuration("15:17"), order: 4 },
            { title: "Hyperparameter Tuning RF using GridSearchCV", videoUrl: "https://www.youtube.com/watch?v=4Im0CT43QxY", duration: parseDuration("11:44"), order: 5 },
            { title: "OOB Score | Out of Bag Evaluation", videoUrl: "https://www.youtube.com/watch?v=tdDhyFoSG94", duration: parseDuration("06:45"), order: 6 },
            { title: "Feature Importance using Random Forest", videoUrl: "https://www.youtube.com/watch?v=R47JAob1xBY", duration: parseDuration("27:20"), order: 7 },
        ],
    },
    {
        title: "Boosting - AdaBoost & Gradient Boosting",
        order: 16,
        lessons: [
            { title: "How Adaboost Classifier Works? | Geometric Intuition", videoUrl: "https://www.youtube.com/watch?v=sFKnP0iP0K0", duration: parseDuration("17:14"), order: 1 },
            { title: "AdaBoost - A Step by Step Explanation", videoUrl: "https://www.youtube.com/watch?v=RT0t9a3Xnfw", duration: parseDuration("19:23"), order: 2 },
            { title: "AdaBoost Algorithm | Code from Scratch", videoUrl: "https://www.youtube.com/watch?v=a20TaKNsriE", duration: parseDuration("16:27"), order: 3 },
            { title: "AdaBoost Hyperparameters | GridSearchCV", videoUrl: "https://www.youtube.com/watch?v=JmXnztjULnQ", duration: parseDuration("11:13"), order: 4 },
            { title: "Gradient Boosting Explained", videoUrl: "https://www.youtube.com/watch?v=fbKz7N92mhQ", duration: parseDuration("32:49"), order: 5 },
            { title: "Gradient Boosting Regression Part 2 | Mathematics", videoUrl: "https://www.youtube.com/watch?v=nMNiTZm-qY0", duration: parseDuration("56:42"), order: 6 },
            { title: "Gradient Boosting for Classification | Geometric Intuition", videoUrl: "https://www.youtube.com/watch?v=4p5EQtyxSyI", duration: parseDuration("1:04:33"), order: 7 },
        ],
    },
    {
        title: "XGBoost",
        order: 17,
        lessons: [
            { title: "Introduction to XGBOOST | Machine Learning", videoUrl: "https://www.youtube.com/watch?v=C6aDw4y8qJ0", duration: parseDuration("1:19:37"), order: 1 },
            { title: "XGBoost for Regression | Part 2", videoUrl: "https://www.youtube.com/watch?v=gmp2tS2joaA", duration: parseDuration("47:17"), order: 2 },
            { title: "XGBoost For Classification | Part 3", videoUrl: "https://www.youtube.com/watch?v=mELtxVUNNrw", duration: parseDuration("39:08"), order: 3 },
            { title: "The Maths Behind XGBoost", videoUrl: "https://www.youtube.com/watch?v=0Eo-_5bfers", duration: parseDuration("1:57:28"), order: 4 },
        ],
    },
    {
        title: "Clustering Algorithms",
        order: 18,
        lessons: [
            { title: "K-Means Clustering Algorithm | Geometric Intuition", videoUrl: "https://www.youtube.com/watch?v=5shTLzwAdEc", duration: parseDuration("23:58"), order: 1 },
            { title: "K-Means Clustering in Python | Practical Example", videoUrl: "https://www.youtube.com/watch?v=UPvv9SprgVo", duration: parseDuration("10:13"), order: 2 },
            { title: "K-Means Clustering From Scratch In Python", videoUrl: "https://www.youtube.com/watch?v=MFraC1JObUo", duration: parseDuration("33:53"), order: 3 },
            { title: "DBSCAN Clustering Algorithms | Density Based Clustering", videoUrl: "https://www.youtube.com/watch?v=1_bLnsNmhCI", duration: parseDuration("34:16"), order: 4 },
            { title: "Agglomerative Hierarchical Clustering | Python Code", videoUrl: "https://www.youtube.com/watch?v=Ka5i9TVUT-E", duration: parseDuration("37:23"), order: 5 },
        ],
    },
    {
        title: "Support Vector Machines",
        order: 19,
        lessons: [
            { title: "Support Vector Machines | Geometric Intuition", videoUrl: "https://www.youtube.com/watch?v=ugTxMLjLS8M", duration: parseDuration("11:46"), order: 1 },
            { title: "Mathematics of SVM | Hard margin SVM", videoUrl: "https://www.youtube.com/watch?v=yCAlHPDgWtM", duration: parseDuration("34:54"), order: 2 },
            { title: "Mathematics of SVM | Soft Margin SVM", videoUrl: "https://www.youtube.com/watch?v=utqrvIFAE1k", duration: parseDuration("14:38"), order: 3 },
            { title: "Kernel Trick in SVM | Code Example", videoUrl: "https://www.youtube.com/watch?v=pjvmVMDrzVU", duration: parseDuration("14:04"), order: 4 },
            { title: "Kernel Trick in SVM | Geometric Intuition", videoUrl: "https://www.youtube.com/watch?v=egxjT0p7_K8", duration: parseDuration("06:18"), order: 5 },
        ],
    },
    {
        title: "Naive Bayes Classifier",
        order: 20,
        lessons: [
            { title: "Naive Bayes Part 1 | Conditional Probability", videoUrl: "https://www.youtube.com/watch?v=Ty7knppVo9E", duration: parseDuration("09:26"), order: 1 },
            { title: "Naive Bayes Part 2 | Independent Events", videoUrl: "https://www.youtube.com/watch?v=0GD480CnrO4", duration: parseDuration("07:59"), order: 2 },
            { title: "Naive Bayes Part 3 | Mutually Exclusive Events", videoUrl: "https://www.youtube.com/watch?v=nneTjTYikBE", duration: parseDuration("01:49"), order: 3 },
            { title: "Naive Bayes Part 4 | Bayes Theorem", videoUrl: "https://www.youtube.com/watch?v=Oqw-v-Z7PuU", duration: parseDuration("04:27"), order: 4 },
            { title: "Naive Bayes Part 5 | Problem based upon Bayes Theorem", videoUrl: "https://www.youtube.com/watch?v=aAEHjXDHtbE", duration: parseDuration("09:00"), order: 5 },
            { title: "Naive Bayes Part 6 | Intuition", videoUrl: "https://www.youtube.com/watch?v=ZR1_QtLk_4U", duration: parseDuration("14:44"), order: 6 },
            { title: "Naive Bayes Part 7 | Mathematics behind the Algorithm", videoUrl: "https://www.youtube.com/watch?v=2PVRG45eVrY", duration: parseDuration("19:09"), order: 7 },
            { title: "Naive Bayes Part 8 | Simple Example Code", videoUrl: "https://www.youtube.com/watch?v=DeeWsqoY4Eo", duration: parseDuration("16:03"), order: 8 },
            { title: "Naive Bayes Part 9 | Handling Numerical Data", videoUrl: "https://www.youtube.com/watch?v=TCgK2nBJx9o", duration: parseDuration("08:47"), order: 9 },
        ],
    },
    {
        title: "KNN & Other Topics",
        order: 21,
        lessons: [
            { title: "K Nearest Neighbors | KNN Explained in Hindi", videoUrl: "https://www.youtube.com/watch?v=abnL_GUGub4", duration: parseDuration("52:01"), order: 1 },
            { title: "Stacking and Blending Ensembles", videoUrl: "https://www.youtube.com/watch?v=O-aDHBGMqXA", duration: parseDuration("35:20"), order: 2 },
            { title: "Imbalanced Data in ML | Undersampling | Oversampling | SMOTE", videoUrl: "https://www.youtube.com/watch?v=yh2AKoJCV3k", duration: parseDuration("57:17"), order: 3 },
            { title: "Hyperparameter Tuning using Optuna | Bayesian Optimization", videoUrl: "https://www.youtube.com/watch?v=E2b3SKMw934", duration: parseDuration("59:23"), order: 4 },
        ],
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const existingSections = await Section.find({ courseId: COURSE_ID });
        const sectionIds = existingSections.map((s) => s._id);

        await Lesson.deleteMany({ sectionId: { $in: sectionIds } });
        await Section.deleteMany({ courseId: COURSE_ID });
        console.log("Cleared existing sections and lessons");

        let totalLessons = 0;

        for (const sectionData of sections) {
            const section = await Section.create({
                courseId: COURSE_ID,
                title: sectionData.title,
                order: sectionData.order,
            });
            console.log(`Created section: ${section.title}`);

            for (const lessonData of sectionData.lessons) {
                await Lesson.create({
                    sectionId: section._id,
                    title: lessonData.title,
                    videoUrl: lessonData.videoUrl,
                    duration: lessonData.duration,
                    order: lessonData.order,
                });
                totalLessons++;
            }
        }

        console.log("\n✅ Seed completed successfully!");
        console.log(`Total sections: ${sections.length}`);
        console.log(`Total lessons: ${totalLessons}`);
        console.log("\n⚠️  DELETE THIS FILE NOW: rm src/seed-ml-course.js");

        process.exit(0);
    } catch (error) {
        console.error("Seed failed:", error);
        process.exit(1);
    }
}

seed();
