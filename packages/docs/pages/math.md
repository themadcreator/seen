

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

Lift(<InlineMath>L</InlineMath>) can be determined by Lift Coeeficient (<InlineMath>C_L</InlineMath>) like the following equation.

<BlockMath>{`
    L = \\frac{1}{2} \\rho v^2 S C_L
`}</BlockMath>


<BlockMath>{`
    \\begin{bmatrix}
        a & b \\\\
        c & d
    \\end{bmatrix}
`}</BlockMath>


<BlockMath>{`
e=2+\\frac{1}{1+\\frac{1}{2+\\frac{1}{ 1+\\frac{1}{1+\\frac{1}{4+\\frac{1}{1+\\frac{1}{1+\\frac{1}{6+\\cdots}}}}}}}}
`}</BlockMath>