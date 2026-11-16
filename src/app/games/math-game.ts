import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-math-game',
  imports: [FormsModule],
  templateUrl: './math-game.html',
})
export class MathGame implements OnDestroy {
  readonly totalQuestions = 10;
  question = 1;
  score = 0;
  left = 0;
  right = 0;
  operator = '+';
  correctAnswer = 0;
  answer: number | null = null;
  checked = false;
  started = false;
  finished = false;
  feedback = '';
  elapsedSeconds = 0;
  averageSeconds: number | null = null;
  private answerTime = 0;
  private questionStartedAt = 0;
  private readonly timer: ReturnType<typeof setInterval>;

  constructor(private readonly changeDetector: ChangeDetectorRef) {
    this.timer = setInterval(() => {
      if (this.started && !this.checked && !this.finished) {
        this.updateTime();
        this.changeDetector.markForCheck();
      }
    }, 100);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  submit() {
    if (!this.started || this.finished) return;

    if (this.checked) {
      if (this.question === this.totalQuestions) {
        this.finished = true;
      } else {
        this.question++;
        this.newQuestion();
      }
      return;
    }

    if (this.answer === null || !Number.isInteger(this.answer)) return;

    this.answerTime += performance.now() - this.questionStartedAt;
    this.elapsedSeconds = this.answerTime / 1000;
    this.averageSeconds = this.elapsedSeconds / this.question;

    if (this.answer === this.correctAnswer) {
      this.score++;
      this.feedback = 'Correct!';
    } else {
      this.feedback = `The correct answer is ${this.correctAnswer}.`;
    }
    this.checked = true;
  }

  startRound() {
    this.started = true;
    this.question = 1;
    this.score = 0;
    this.finished = false;
    this.answerTime = 0;
    this.elapsedSeconds = 0;
    this.averageSeconds = null;
    this.newQuestion();
  }

  private newQuestion() {
    const first = Math.floor(Math.random() * 10) + 1;
    const second = Math.floor(Math.random() * 10) + 1;
    const operation = Math.floor(Math.random() * 4);

    this.left = first;
    this.right = second;

    switch (operation) {
      case 0:
        this.operator = '+';
        this.correctAnswer = first + second;
        break;
      case 1:
        this.operator = '−';
        this.left = Math.max(first, second);
        this.right = Math.min(first, second);
        this.correctAnswer = this.left - this.right;
        break;
      case 2:
        this.operator = '×';
        this.correctAnswer = first * second;
        break;
      default:
        this.operator = '÷';
        this.left = first * second;
        this.correctAnswer = first;
    }

    this.answer = null;
    this.checked = false;
    this.feedback = '';
    this.questionStartedAt = performance.now();
  }

  private updateTime() {
    this.elapsedSeconds = (this.answerTime + performance.now() - this.questionStartedAt) / 1000;
  }
}
