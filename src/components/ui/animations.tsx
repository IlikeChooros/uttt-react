'use client';

import React from 'react';

import {
	animate,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from 'motion/react';

export function AnimatedNumber() {
	const base = useMotionValue(0);
	const smooth = useSpring(base, { stiffness: 120, damping: 18 });
	const text = useTransform(smooth, (v) => v.toFixed(2));

	React.useEffect(() => {
		const controls = animate(base, 1, {
			duration: 3,
			ease: 'easeInOut',
			repeat: Infinity,
			repeatType: 'reverse',
		});
		return () => controls.stop();
	}, [base]);

	return <motion.span>{text}</motion.span>;
}

const variants = {
	idle: { opacity: 1, filter: 'blur(0px)' },
	thinking: {
		opacity: [0.4, 1, 0.4],
		filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
		transition: { duration: 1.4, repeat: Infinity },
	},
};

export function StatusText({
	thinking,
	readyText,
	thinkingText,
}: {
	thinking?: boolean;
	readyText?: string;
	thinkingText?: string;
}) {
	return (
		<motion.span
			variants={variants}
			initial="idle"
			animate={thinking ? 'thinking' : 'idle'}
			style={{ display: 'inline-block' }}
		>
			{thinking ? thinkingText : readyText}
		</motion.span>
	);
}
