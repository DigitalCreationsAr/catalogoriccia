import React from 'react';

interface OricciaLogoProps {
  className?: string;
  height?: number | string;
}

export const OricciaLogo: React.FC<OricciaLogoProps> = ({ className = 'h-8 w-auto', height }) => {
  return (
    <svg
      viewBox="0 0 490 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={height ? { height } : undefined}
      aria-label="Oriccia Atelier"
      role="img"
    >
      <title>Oriccia</title>
      {/* 'or' in Forest Green (#0E4A25) */}
      <g fill="#0E4A25" className="transition-colors duration-200">
        {/* letter 'o' - plump vintage curve with leaning counter */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 52,18 
             C 22,18 0,40 0,69 
             C 0,98 22,120 52,120 
             C 82,120 102,98 102,69 
             C 102,40 82,18 52,18 Z 
             M 56,41 
             C 71,37 78,49 76,69 
             C 74,88 64,98 48,96 
             C 33,94 28,82 31,65 
             C 34,48 43,43 56,41 Z"
        />

        {/* letter 'r' - curved shoulder with teardrop terminal hugging the 'o' */}
        <path
          d="M 94,36 
             C 94,36 104,33 110,33 
             C 116,33 120,37 120,43 
             L 120,53 
             C 128,39 140,32 155,32 
             C 172,32 185,41 185,57 
             C 185,71 171,76 160,70 
             C 149,64 142,67 137,76 
             L 137,110 
             C 137,117 132,120 124,120 
             C 116,120 112,115 112,110 
             L 112,48 
             C 112,43 108,42 102,42 
             C 97,42 94,39 94,36 Z"
        />
      </g>

      {/* 'iccia' in Dusty Rose / Blush Terracotta (#C8878C) */}
      <g fill="#C8878C" className="transition-colors duration-200">
        {/* letter 'i' (first) */}
        <circle cx="204" cy="18" r="12" />
        <path
          d="M 193,36 
             C 193,32 196,30 202,30 
             C 208,30 212,32 212,36 
             L 212,110 
             C 212,115 208,119 202,119 
             C 196,119 193,115 193,110 
             Z"
        />

        {/* letter 'c' (first) - soft teardrop terminal */}
        <path
          d="M 276,52 
             C 273,42 264,32 248,32 
             C 226,32 212,49 212,74 
             C 212,99 227,118 249,118 
             C 266,118 276,108 280,98 
             C 282,92 278,88 272,88 
             C 268,88 264,91 261,95 
             C 257,100 251,103 245,103 
             C 234,103 226,92 226,75 
             C 226,58 234,46 245,46 
             C 252,46 258,50 261,56 
             C 264,61 269,63 273,61 
             C 277,58 278,55 276,52 Z"
        />

        {/* letter 'c' (second) - nested rhythm */}
        <path
          d="M 338,52 
             C 335,42 326,32 310,32 
             C 288,32 274,49 274,74 
             C 274,99 289,118 311,118 
             C 328,118 338,108 342,98 
             C 344,92 340,88 334,88 
             C 330,88 326,91 323,95 
             C 319,100 313,103 307,103 
             C 296,103 288,92 288,75 
             C 288,58 296,46 307,46 
             C 314,46 320,50 323,56 
             C 326,61 331,63 335,61 
             C 339,58 340,55 338,52 Z"
        />

        {/* letter 'i' (second) */}
        <circle cx="362" cy="18" r="12" />
        <path
          d="M 351,36 
             C 351,32 354,30 360,30 
             C 366,30 370,32 370,36 
             L 370,110 
             C 370,115 366,119 360,119 
             C 354,119 351,115 351,110 
             Z"
        />

        {/* letter 'a' with romantic swash flourish */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 416,31 
             C 396,31 379,47 379,74 
             C 379,100 395,118 416,118 
             C 427,118 437,112 443,103 
             L 443,110 
             C 443,124 451,133 466,133 
             C 477,133 486,126 491,116 
             C 494,111 491,105 484,105 
             C 480,105 476,108 473,112 
             C 469,117 465,120 460,120 
             C 454,120 451,114 451,104 
             L 451,40 
             C 451,34 447,31 441,31 
             L 433,31 
             C 429,31 426,34 426,38 
             C 426,44 429,49 430,53 
             C 426,40 422,31 416,31 Z 
             M 417,46 
             C 428,46 435,58 435,74 
             C 435,90 428,102 417,102 
             C 406,102 399,90 399,74 
             C 399,58 406,46 417,46 Z"
        />
      </g>
    </svg>
  );
};
